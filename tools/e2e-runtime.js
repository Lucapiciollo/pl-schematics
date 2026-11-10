#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Verifica a runtime di un'app generata (headless Chrome via playwright-core).
 *
 * Uso: node tools/e2e-runtime.js --dir <app> [--http] [--i18n] [--azure] [--port 4300]
 *   - build development (ng build -c development --output-path dist-rt) e server statico con fallback SPA
 *   - stub API su :3001 (baseUrl dell'environment generato) che conta le richieste
 *   - controlla: nessun errore di console / pageerror, home e <pl-loading-overlay> nel DOM,
 *     it.json caricato (200) e usato, interceptor non eseguito due volte (1 sola richiesta al BE).
 *   - --azure: senza credenziali reali verifica solo che il bootstrap non si rompa: l'app tenta il
 *     redirect verso login.microsoftonline.com (intercettato) e non produce errori applicativi non gestiti.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

function arg(name, fallback) { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); }
const dir = path.resolve(arg('dir', '.'));
const port = parseInt(arg('port', '4300'), 10);
const expectHttp = !!arg('http', false);
const expectI18n = !!arg('i18n', false);
const azure = !!arg('azure', false);
const { chromium } = require('playwright-core');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon', '.map': 'application/json' };

function serveStatic(root) {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
}

(async () => {
  const out = path.join(dir, 'dist-rt');
  fs.rmSync(out, { recursive: true, force: true });
  const build = spawnSync('npx ng build --configuration development --output-path dist-rt', { cwd: dir, shell: true, encoding: 'utf8', env: { ...process.env, CI: 'true' } });
  if (build.status !== 0) { console.log((build.stdout + build.stderr).slice(-3000)); throw new Error('development build failed'); }
  const root = fs.existsSync(path.join(out, 'browser')) ? path.join(out, 'browser') : out;

  const apiHits = [];
  const api = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    apiHits.push(req.method + ' ' + req.url);
    res.setHeader('Content-Type', 'application/json');
    res.end('{"ok":true}');
  }).listen(3001);
  const web = serveStatic(root).listen(port);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => { if (!/microsoftonline/.test(r.url())) errors.push('requestfailed: ' + r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && !/microsoftonline/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('request', (r) => requests.push(r.url()));
  if (azure) await page.route(/login\.microsoftonline\.com|graph\.microsoft\.com/, (route) => route.abort());

  const checks = [];
  const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); console.log((ok ? 'OK   ' : 'FAIL ') + name + (detail ? '  -> ' + detail : '')); };

  await page.goto('http://localhost:' + port + '/#/home', { waitUntil: 'load' }).catch((e) => errors.push('goto: ' + e.message));

  if (azure) {
    await page.waitForTimeout(6000);
    const msRequest = requests.find((u) => /login\.microsoftonline\.com/.test(u));
    check('MSAL: bootstrap tenta il login/redirect Azure (senza credenziali reali)', !!msRequest, msRequest ? msRequest.slice(0, 90) : 'nessun redirect osservato');
    check('MSAL: nessun errore applicativo non gestito', errors.length === 0, errors.join(' | '));
  } else {
    await page.waitForSelector('app-home', { timeout: 15000 }).catch(() => undefined);
    if (expectI18n) await page.waitForFunction(() => /\\(Home\\)/.test((document.querySelector('app-home') || {}).innerText || ''), undefined, { timeout: 10000 }).catch(() => undefined);
    const home = await page.locator('app-home').innerText().catch(() => '');
    check('home visibile (app-home)', /home works!/.test(home), JSON.stringify(home));
    const loaders = await page.locator('pl-loading-overlay').count();
    check('loader presenti nel DOM (<pl-loading-overlay>)', loaders >= 2, 'count=' + loaders);
    if (expectI18n) {
      const it = requests.filter((u) => /assets\/public\/i18n\/it\.json/.test(u));
      check('it.json richiesto una volta e 200', it.length === 1, 'richieste=' + it.length);
      check('traduzione applicata ("Home")', /\(Home\)/.test(home), JSON.stringify(home));
    }
    if (expectHttp) {
      const result = await page.evaluate(async () => {
        try {
        const el = document.querySelector('app-home');
        const comp = window.ng && window.ng.getComponent(el);
        const client = comp && comp.httpService && comp.httpService.http;
        if (!client) return 'no-client';
        await new Promise((resolve) => client.get('http://localhost:3001/api/ping').subscribe({ next: resolve, error: resolve }));
        return 'done';
        } catch (e) { return 'error: ' + e.message; }
      });
      await page.waitForTimeout(500);
      const pings = apiHits.filter((h) => /\/api\/ping/.test(h));
      check('interceptor: una sola richiesta HTTP per chiamata (no doppioni)', result === 'done' && pings.length === 1, 'esito=' + result + ' richieste al BE=' + pings.length);
    }
    check('nessun errore di console / pageerror / richiesta fallita', errors.length === 0, errors.join(' | '));
  }

  if (errors.length) console.log('errori raccolti:\n  ' + errors.slice(0, 15).join('\n  '));
  await browser.close();
  api.close(); web.close();
  const failed = checks.filter((c) => !c.ok).length;
  console.log(failed ? '\nRUNTIME FAIL (' + failed + ')' : '\nRUNTIME PASS');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
