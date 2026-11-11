#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Matrice e2e riproducibile di pl-schematics.
 *
 * Per ogni riga (versione Angular x architettura x combinazione di opzioni):
 *   1. `npx @angular/cli@<v> new` (--skip-git, --skip-install, --standalone true|false)   [cache per versione/architettura/strict]
 *   2. schematic pl-schematics (collection locale del repo, --no-dry-run --no-debug, opzioni kebab-case)
 *   3. npm install
 *   4. `ng build` (tutti i progetti del workspace: app + librerie shared/ngrx)
 *   5. se tests != none: compilazione dei file spec (`tsc -p tsconfig.spec.json --noEmit`)
 *      ed esecuzione headless dei test (`ng test --watch=false`, default; --skip-tests-run per saltarla)
 *   6. verifica runtime (tools/e2e-runtime.js, headless Chrome): home, loader, i18n, interceptor, console pulita; --skip-runtime per saltarla
 *   -> PASS/FAIL per riga (PASS solo se TUTTI i passi sono andati a buon fine).
 *
 * Uso:
 *   node tools/e2e-matrix.js                          # tutto: 19, 20, 21 x classic/standalone x tutti i casi
 *   node tools/e2e-matrix.js --angular 19             # una sola major
 *   node tools/e2e-matrix.js --angular 19 --arch standalone --case azure
 *   node tools/e2e-matrix.js --list                   # elenca casi e righe senza eseguire
 *   node tools/e2e-matrix.js --jobs 3 --keep          # righe in parallelo, mantiene le cartelle
 *   node tools/e2e-matrix.js --skip-tests-run         # salta `ng test` (di default i test girano: Karma+ChromeHeadless su Angular 19/20, runner predefinito vitest su 21)
 *   node tools/e2e-matrix.js --skip-runtime           # salta la verifica runtime (headless Chrome)
 *
 * Opzioni: --angular <19|20|21|all> --arch <classic|standalone|both> --case <nome|all>
 *          --strict <true|false|both> (flag di `ng new`, default both solo per il caso "base", true altrove)
 *          --work <dir> (default: <tmp>/pl-schematics-e2e) --jobs <n> --keep --list --fresh
 *          --skip-tests-run (non esegue `ng test`; `--run-tests` e' accettato ma ridondante: e' il default)
 *          --skip-runtime (non esegue la verifica runtime)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const SCHEMATICS_BIN = path.join(REPO, 'node_modules', '@angular-devkit', 'schematics-cli', 'bin', 'schematics.js');

/** Casi: opzioni dello schematic in kebab-case (come richiesto da schematics-cli). */
const CASES = {
  base: { description: 'default dello schematic', namePackage: 'my-app', options: {} },
  full: {
    description: 'material + ngrx + interceptor classic + logging advanced + jasmine',
    namePackage: 'full-app',
    options: { ui: 'material', state: 'ngrx', http: 'interceptor-classic', logging: 'advanced', i18n: 'ngx-translate', tests: 'jasmine' },
  },
  bootstrap: {
    description: 'bootstrap + interceptor functional + logging advanced + jasmine + sonar + docs + mock-api + github-actions',
    namePackage: 'bs-app',
    options: {
      ui: 'bootstrap', http: 'interceptor-functional', logging: 'advanced', tests: 'jasmine', ci: 'github-actions',
      'enable-sonar-qube': 'Y', 'include-documentation': 'true', 'mock-api': 'node-express', state: 'none',
    },
  },
  azure: {
    description: 'login Azure AD (MSAL) + interceptor + azure-devops + jasmine',
    namePackage: 'azure-app',
    options: { 'login-support-configuration': 'AZURE-ACTIVE-DIRECT', http: 'interceptor-classic', ci: 'azure-devops', logging: 'advanced', tests: 'jasmine', state: 'ngrx' },
  },
  minimal: {
    description: 'i18n none, state none, http none, logging none, tests none',
    namePackage: 'min-app',
    options: { i18n: 'none', state: 'none', http: 'none', logging: 'none', tests: 'none', ui: 'none' },
  },
  nested: {
    description: 'namePackage con percorso (cloud/agic) + strict=true dello schematic',
    namePackage: 'cloud/agic',
    options: { ui: 'material', state: 'ngrx', http: 'interceptor-functional', strict: 'true' },
  },
};

function parseArgs(argv) {
  const args = { angular: 'all', arch: 'both', case: 'all', strict: 'auto', work: path.join(os.tmpdir(), 'pl-schematics-e2e'), jobs: 1, keep: false, runTests: true, runtime: true, list: false, fresh: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--angular': args.angular = next(); break;
      case '--arch': args.arch = next(); break;
      case '--case': args.case = next(); break;
      case '--strict': args.strict = next(); break;
      case '--work': args.work = path.resolve(next()); break;
      case '--jobs': args.jobs = parseInt(next(), 10) || 1; break;
      case '--keep': args.keep = true; break;
      case '--run-tests': args.runTests = true; break;
      case '--skip-tests-run': args.runTests = false; break;
      case '--skip-runtime': args.runtime = false; break;
      case '--list': args.list = true; break;
      case '--fresh': args.fresh = true; break;
      default: throw new Error('Unknown argument: ' + a);
    }
  }
  return args;
}

function run(command, cwd, logFile, extra = {}) {
  fs.appendFileSync(logFile, '\n$ ' + command + '   (cwd: ' + cwd + ')\n');
  const started = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    timeout: extra.timeout || 20 * 60 * 1000,
    env: { ...process.env, CI: 'true', NG_CLI_ANALYTICS: 'false', PL_DEPS_CHECK: 'false', FORCE_COLOR: '0', NO_COLOR: '1', ...(extra.env || {}) },
  });
  const output = (result.stdout || '') + (result.stderr || '');
  fs.appendFileSync(logFile, output + '\n[exit ' + result.status + ' in ' + Math.round((Date.now() - started) / 1000) + 's]\n');
  return { ok: result.status === 0, output, status: result.status };
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  if (process.platform === 'win32') {
    // robocopy: ordini di grandezza piu' veloce di fs.cpSync su node_modules. Exit code < 8 = successo.
    const r = spawnSync('robocopy', [src, dest, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/MT:16'], { encoding: 'utf8' });
    if (r.status >= 8) throw new Error('robocopy failed (' + r.status + '): ' + r.stdout);
  } else {
    fs.cpSync(src, dest, { recursive: true });
  }
}

function lastLines(text, count) {
  return text.trim().split(/\r?\n/).slice(-count).join('\n');
}

const baseCache = new Map();

/** Crea (una volta sola) il progetto `ng new` + npm install per versione/architettura/strict. */
function ensureBase(args, major, standalone, strict) {
  const key = ['ng' + major, standalone ? 'standalone' : 'classic', strict ? 'strict' : 'nostrict'].join('-');
  const dir = path.join(args.work, 'base', key);
  if (baseCache.has(key)) return baseCache.get(key);
  const promise = (() => {
    const marker = path.join(dir, '.base-ready');
    if (!args.fresh && fs.existsSync(marker)) return { ok: true, dir: path.join(dir, 'app') };
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const log = path.join(dir, 'base.log');
    const cmd = 'npx --yes @angular/cli@' + major + ' new app --skip-git --skip-install --routing --style css --ssr false --defaults' +
      ' --standalone ' + standalone + ' --strict ' + strict + ' --package-manager npm';
    let r = run(cmd, dir, log);
    if (!r.ok) return { ok: false, step: 'ng new', detail: lastLines(r.output, 15) };
    r = run('npm install --no-audit --no-fund --loglevel error', path.join(dir, 'app'), log);
    if (!r.ok) return { ok: false, step: 'base npm install', detail: lastLines(r.output, 15) };
    fs.writeFileSync(marker, new Date().toISOString());
    return { ok: true, dir: path.join(dir, 'app') };
  })();
  baseCache.set(key, promise);
  return promise;
}

function toCliArgs(options) {
  return Object.keys(options).map((k) => '--' + k + '=' + options[k]).join(' ');
}

function runRow(args, row) {
  const rowDir = path.join(args.work, 'rows', row.id);
  fs.rmSync(rowDir, { recursive: true, force: true });
  fs.mkdirSync(rowDir, { recursive: true });
  const log = path.join(rowDir, 'e2e.log');
  const result = { ...row, steps: {}, status: 'FAIL', failedStep: null, detail: '', seconds: 0 };
  const started = Date.now();
  const fail = (step, detail) => { result.failedStep = step; result.detail = detail; result.steps[step] = 'FAIL'; };

  const base = ensureBase(args, row.angular, row.arch === 'standalone', row.ngStrict);
  if (!base.ok) { fail(base.step, base.detail); result.seconds = Math.round((Date.now() - started) / 1000); return result; }
  result.steps['ng new'] = 'OK';

  const appDir = path.join(rowDir, 'app');
  copyDir(base.dir, appDir);

  const collection = path.relative(appDir, path.join(REPO, 'src', 'collection.json')).replace(/\\/g, '/');
  const schematicCmd = 'node "' + SCHEMATICS_BIN + '" ' + collection + ':pl-schematics --name-package=' + row.namePackage +
    ' ' + toCliArgs(row.options) + ' --no-dry-run --no-debug --force';
  result.command = schematicCmd.replace(SCHEMATICS_BIN, 'node_modules/@angular-devkit/schematics-cli/bin/schematics.js');

  let r = run(schematicCmd, appDir, log, { timeout: 15 * 60 * 1000 });
  if (!r.ok) { fail('schematic', lastLines(r.output, 20)); }
  else {
    result.steps.schematic = 'OK';
    r = run('npm install --no-audit --no-fund --loglevel error', appDir, log);
    if (!r.ok) { fail('npm install', lastLines(r.output, 25)); }
    else {
      result.steps['npm install'] = 'OK';
      r = run('npx ng build', appDir, log);
      if (!r.ok) { fail('ng build', lastLines(r.output, 40)); }
      else {
        result.steps['ng build'] = 'OK';
        // `ng build` senza argomenti compila solo l'applicazione: le librerie generate (ng-packagr) si compilano a parte.
        const workspace = JSON.parse(fs.readFileSync(path.join(appDir, 'angular.json'), 'utf8'));
        const libraries = Object.keys(workspace.projects).filter((name) => workspace.projects[name].projectType === 'library');
        for (const lib of libraries) {
          r = run('npx ng build ' + lib, appDir, log);
          if (!r.ok) { fail('ng build ' + lib, lastLines(r.output, 40)); break; }
          result.steps['ng build ' + lib] = 'OK';
        }
        const tests = row.options.tests || 'jasmine';
        if (!result.failedStep && tests !== 'none') {
          r = run('npx tsc -p tsconfig.spec.json --noEmit', appDir, log);
          if (!r.ok) { fail('spec compile', lastLines(r.output, 30)); }
          else {
            result.steps['spec compile'] = 'OK';
            if (args.runTests) {
              const cmd = row.angular >= 21 ? 'npx ng test --watch=false' : 'npx ng test --watch=false --browsers=ChromeHeadless';
              r = run(cmd, appDir, log, { timeout: 15 * 60 * 1000 });
              result.steps['ng test'] = r.ok ? 'OK' : 'FAIL';
              if (!r.ok) fail('ng test', lastLines(r.output, 30));
            }
          }
        }
        if (!result.failedStep) result.status = 'PASS';
      }
    }
  }

  result.seconds = Math.round((Date.now() - started) / 1000);
  // Con la verifica runtime l'app resta su disco fino alla fase finale (sequenziale: porte fisse 3001/4300).
  if (result.status === 'PASS' && !args.keep && !args.runtime) fs.rmSync(appDir, { recursive: true, force: true });
  return result;
}

function buildRows(args) {
  const majors = args.angular === 'all' ? [19, 20, 21] : args.angular.split(',').map((v) => parseInt(v, 10));
  const archs = args.arch === 'both' ? ['classic', 'standalone'] : [args.arch];
  const caseNames = args.case === 'all' ? Object.keys(CASES) : args.case.split(',');
  const rows = [];
  majors.forEach((major) => archs.forEach((arch) => caseNames.forEach((name) => {
    if (!CASES[name]) throw new Error('Unknown case "' + name + '". Available: ' + Object.keys(CASES).join(', '));
    // `ng new` e' strict di default: "base" prova anche --strict false.
    const stricts = args.strict === 'both' ? [true, false]
      : args.strict === 'true' ? [true] : args.strict === 'false' ? [false]
        : name === 'base' ? [true, false] : [true];
    stricts.forEach((ngStrict) => rows.push({
      id: ['ng' + major, arch, name, ngStrict ? 'strict' : 'nostrict'].join('-'),
      angular: major, arch, case: name, ngStrict,
      namePackage: CASES[name].namePackage, options: CASES[name].options,
    }));
  })));
  return rows;
}

function toMarkdown(results) {
  const lines = ['| Angular | Architettura | Caso | ng new strict | Esito | Passo fallito | Tempo |', '|---|---|---|---|---|---|---|'];
  results.forEach((r) => lines.push('| ' + r.angular + ' | ' + r.arch + ' | ' + r.case + ' | ' + r.ngStrict + ' | **' + r.status + '** | ' + (r.failedStep || '-') + ' | ' + r.seconds + 's |'));
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = buildRows(args);

  if (args.list) {
    Object.keys(CASES).forEach((n) => console.log(n.padEnd(10) + CASES[n].description + '  [' + CASES[n].namePackage + ' ' + toCliArgs(CASES[n].options) + ']'));
    console.log('\n' + rows.length + ' righe:');
    rows.forEach((r) => console.log('  ' + r.id));
    return;
  }

  if (!fs.existsSync(SCHEMATICS_BIN)) throw new Error('Run "npm install" in the repo first (schematics-cli not found).');
  const compiled = path.join(REPO, 'src', 'pl-schematics', 'index.js');
  if (!fs.existsSync(compiled)) throw new Error('Run "npm run build" first (' + compiled + ' missing).');

  fs.mkdirSync(args.work, { recursive: true });
  console.log('Work dir: ' + args.work + '  |  righe: ' + rows.length + '  |  jobs: ' + args.jobs + '\n');

  const results = [];
  const queue = rows.slice();
  // Il lavoro e' sincrono (spawnSync): con --jobs>1 si usano processi figli dedicati.
  if (args.jobs > 1) {
    // Le basi (ng new + install) si preparano prima, in sequenza, per evitare corse tra processi figli.
    rows.forEach((row) => {
      const base = ensureBase(args, row.angular, row.arch === 'standalone', row.ngStrict);
      if (!base.ok) console.log('BASE FAIL ng' + row.angular + ' ' + row.arch + ' [' + base.step + ']\n' + base.detail);
    });
    const { fork } = require('child_process');
    await new Promise((resolve) => {
      let active = 0;
      const startNext = () => {
        if (!queue.length && active === 0) return resolve();
        while (active < args.jobs && queue.length) {
          const row = queue.shift();
          active++;
          const child = fork(__filename, ['--child-row', JSON.stringify(row), '--work', args.work, ...(args.keep ? ['--keep'] : []), ...(args.runTests ? [] : ['--skip-tests-run']), ...(args.runtime ? [] : ['--skip-runtime'])].filter(Boolean), { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
          child.on('message', (res) => { results.push(res); console.log((res.status === 'PASS' ? 'PASS ' : 'FAIL ') + res.id + (res.failedStep ? '  [' + res.failedStep + ']' : '') + '  ' + res.seconds + 's'); });
          child.on('exit', () => { active--; startNext(); });
        }
      };
      startNext();
    });
  } else {
    queue.forEach((row) => {
      const res = runRow(args, row);
      results.push(res);
      console.log((res.status === 'PASS' ? 'PASS ' : 'FAIL ') + res.id + (res.failedStep ? '  [' + res.failedStep + ']' : '') + '  ' + res.seconds + 's');
      if (res.detail) console.log(res.detail.split('\n').map((l) => '      ' + l).join('\n'));
    });
  }

  if (args.runtime) {
    for (const res of results.filter((r) => r.status === 'PASS')) {
      const appDir = path.join(args.work, 'rows', res.id, 'app');
      const flags = [];
      if ((res.options.http || 'none') !== 'none' || res.options['login-support-configuration'] === 'AZURE-ACTIVE-DIRECT') flags.push('--http');
      if ((res.options.i18n || 'ngx-translate') !== 'none') flags.push('--i18n');
      if (res.options['login-support-configuration'] === 'AZURE-ACTIVE-DIRECT') flags.push('--azure');
      const rt = run('node "' + path.join(__dirname, 'e2e-runtime.js') + '" --dir "' + appDir + '" ' + flags.join(' '), appDir, path.join(args.work, 'rows', res.id, 'e2e.log'), { timeout: 15 * 60 * 1000 });
      res.steps.runtime = rt.ok ? 'OK' : 'FAIL';
      if (!rt.ok) { res.status = 'FAIL'; res.failedStep = 'runtime'; res.detail = lastLines(rt.output, 20); }
      console.log((rt.ok ? 'PASS ' : 'FAIL ') + res.id + ' [runtime ' + flags.join(' ') + ']');
      if (rt.ok && !args.keep) fs.rmSync(path.join(args.work, 'rows', res.id, 'app'), { recursive: true, force: true });
    }
  }

  results.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(path.join(args.work, 'results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(args.work, 'results.md'), toMarkdown(results) + '\n');
  console.log('\n' + toMarkdown(results));
  console.log('\nResults: ' + path.join(args.work, 'results.md'));
  const failed = results.filter((r) => r.status !== 'PASS').length;
  console.log(failed ? '\n' + failed + ' FAIL su ' + results.length : '\nTutte le ' + results.length + ' righe PASS');
  process.exitCode = failed ? 1 : 0;
}

// Modalita' figlio (usata da --jobs > 1)
const childIdx = process.argv.indexOf('--child-row');
if (childIdx >= 0) {
  const row = JSON.parse(process.argv[childIdx + 1]);
  const args = parseArgs(process.argv.slice(2).filter((a, i, all) => a !== '--child-row' && all[i - 1] !== '--child-row'));
  const res = runRow(args, row);
  process.send(res, () => process.exit(0));
} else if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exit(2); });
}

module.exports = { CASES, buildRows };
