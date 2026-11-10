#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Installazione "da utente": npm pack -> ng new pulito -> npm i <tgz> -> `ng generate pl-schematics:pl-schematics` -> ng build.
 *
 * Uso: node tools/e2e-pack.js [--angular 19] [--standalone true|false] [--work <dir>] [--keep]
 * Verifica anche il contenuto del tarball (files/**, .js compilati, README, CHANGELOG, collection/schema).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function arg(name, fallback) { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; }
const major = parseInt(arg('angular', '19'), 10);
const standalone = arg('standalone', 'true');
const work = path.resolve(arg('work', path.join(os.tmpdir(), 'pl-schematics-pack')));
const REPO = path.resolve(__dirname, '..');
const env = { ...process.env, CI: 'true', NG_CLI_ANALYTICS: 'false', PL_DEPS_CHECK: 'false', NO_COLOR: '1' };

function sh(cmd, cwd) {
  console.log('$ ' + cmd);
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', env, maxBuffer: 256 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) { console.log(out.slice(-4000)); throw new Error('FAILED: ' + cmd); }
  return out;
}

const results = [];
function check(name, ok, detail) { results.push({ name, ok }); console.log((ok ? 'OK   ' : 'FAIL ') + name + (detail ? '  -> ' + detail : '')); }

try {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  sh('npm run build', REPO);
  const packOut = sh('npm pack --pack-destination "' + work + '"', REPO).split(/\r?\n/).map((l) => l.trim()).filter((l) => /^pl-schematics-.*\.tgz$/.test(l)).pop();
  const tgz = path.join(work, packOut);
  const entries = sh('tar -tzf "' + tgz + '"', work).split(/\r?\n/).filter(Boolean).map((e) => e.replace(/^package\//, ''));
  const has = (p) => entries.indexOf(p) >= 0;
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));

  check('tarball: package.json, README.md, CHANGELOG.md', has('package.json') && has('README.md') && has('CHANGELOG.md'));
  (pkg.files || []).filter((f) => !fs.existsSync(path.join(REPO, f))).forEach((f) => check('`files` cita un file inesistente: ' + f, false));
  check('tarball: collection.json, schema.json, index.js compilato', has('src/collection.json') && has('src/pl-schematics/schema.json') && has('src/pl-schematics/index.js'));
  const rulesJs = fs.readdirSync(path.join(REPO, 'src/pl-schematics/rules')).filter((f) => f.endsWith('.js'));
  check('tarball: tutte le rule .js (' + rulesJs.length + ')', rulesJs.every((f) => has('src/pl-schematics/rules/' + f)));
  const utilsJs = fs.readdirSync(path.join(REPO, 'src/pl-schematics/utils')).filter((f) => f.endsWith('.js'));
  check('tarball: tutte le utils .js (' + utilsJs.length + ')', utilsJs.every((f) => has('src/pl-schematics/utils/' + f)));
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  const filesDir = path.join(REPO, 'src/pl-schematics/files');
  const templates = walk(filesDir).map((f) => 'src/pl-schematics/files/' + path.relative(filesDir, f).replace(/\\/g, '/'));
  const missing = templates.filter((t) => !has(t));
  check('tarball: tutti i template files/** (' + templates.length + ', inclusi dotfile .github)', missing.length === 0, missing.slice(0, 5).join(', '));

  const app = path.join(work, 'app');
  sh('npx --yes @angular/cli@' + major + ' new app --skip-git --skip-install --routing --style css --ssr false --defaults --standalone ' + standalone + ' --package-manager npm', work);
  sh('npm install --no-audit --no-fund --loglevel error', app);
  sh('npm install -D "' + tgz + '" --no-audit --no-fund --loglevel error', app);
  check('installato in node_modules/pl-schematics', fs.existsSync(path.join(app, 'node_modules', 'pl-schematics', 'src', 'collection.json')));

  const out = sh('npx ng generate pl-schematics:pl-schematics --name-package=my-app --ui=material --state=ngrx --http=interceptor-classic --logging=advanced --no-interactive', app);
  check('ng generate pl-schematics:pl-schematics eseguito', /CREATE/.test(out) && /UPDATE/.test(out));
  sh('npm install --no-audit --no-fund --loglevel error', app);
  sh('npx ng build', app);
  check('ng build dopo l\'installazione da tarball', true);
  sh('npx ng build my-app-shared', app);
  sh('npx ng build my-app-ngrx', app);
  check('ng build delle librerie generate', true);
} catch (e) {
  check(e.message, false);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? '\nPACK FAIL (' + failed + ')' : '\nPACK PASS');
if (!process.argv.includes('--keep') && !failed) fs.rmSync(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
