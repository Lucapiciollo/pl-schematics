#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Rilascio di pl-schematics: decide da solo il tipo di aumento di versione, verifica, pubblica su npm e tagga.
 *
 * Come decide l'aumento (dall'ultima versione rilasciata fino a HEAD):
 *   MAJOR  - un commit con `!` dopo il tipo (feat!: ...) o con "BREAKING CHANGE", oppure lo schema delle opzioni
 *            (src/pl-schematics/schema.json) perde un'opzione, un valore di enum o cambia un default
 *   MINOR  - un commit `feat` oppure una nuova opzione nello schema
 *   PATCH  - tutto il resto (fix, perf, refactor, docs, build, ci, test, chore, messaggi non convenzionali)
 *
 * Se la versione di package.json e' gia' superiore a quella sul registry npm (versione mai pubblicata) viene
 * pubblicata cosi' com'e', senza aumentarla.
 *
 * Uso:
 *   node tools/publish.js                 # mostra il piano (versione, motivi, controlli) e NON pubblica
 *   node tools/publish.js --yes           # esegue: test, bump, changelog, commit, npm publish, tag, push
 *   node tools/publish.js --yes --dry-run # come sopra ma `npm publish --dry-run` e nessun push/tag
 *
 * Opzioni:
 *   --yes            conferma la pubblicazione reale (senza questa il comando mostra solo il piano)
 *   --bump <livello> forza major|minor|patch invece della decisione automatica
 *   --dry-run        npm publish --dry-run; non fa push ne' tag
 *   --no-push        pubblica ma non fa push di branch e tag
 *   --skip-tests     salta `npm test` (sconsigliato)
 *   --tag <dist-tag> dist-tag npm (default: latest)
 *   --allow-branch   consente di rilasciare da un branch diverso da main
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const PKG = path.join(REPO, 'package.json');
const SCHEMA = 'src/pl-schematics/schema.json';

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Confronta due versioni semver (solo numeri major.minor.patch).
 * @param a :prima versione
 * @param b :seconda versione
 * @returns negativo se a < b, 0 se uguali, positivo se a > b
 */
function compareVersions(a, b) {
  const pa = String(a).split('-')[0].split('.').map(Number);
  const pb = String(b).split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Calcola la versione successiva.
 * @param version :versione di partenza (x.y.z)
 * @param level   :major, minor o patch
 * @returns la nuova versione
 */
function bumpVersion(version, level) {
  const [ma, mi, pa] = String(version).split('-')[0].split('.').map(Number);
  if (level === 'major') return (ma + 1) + '.0.0';
  if (level === 'minor') return ma + '.' + (mi + 1) + '.0';
  return ma + '.' + mi + '.' + (pa + 1);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Interpreta un messaggio di commit secondo Conventional Commits.
 * @param message :messaggio completo (oggetto + corpo)
 * @returns { type, scope, breaking, subject }
 */
function parseCommit(message) {
  const lines = String(message).split(/\r?\n/);
  const head = lines[0] || '';
  const m = head.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.*)$/);
  const breakingBody = /(^|\n)BREAKING[ -]CHANGE/.test(message);
  if (!m) return { type: 'other', scope: '', breaking: breakingBody, subject: head };
  return { type: m[1].toLowerCase(), scope: m[2] || '', breaking: !!m[3] || breakingBody, subject: m[4] };
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Confronta due versioni dello schema delle opzioni dello schematic.
 * @param oldSchema :schema alla versione precedente (oggetto) o null
 * @param newSchema :schema attuale (oggetto)
 * @returns { breaking: string[], features: string[] } descrizioni delle differenze
 */
function diffSchema(oldSchema, newSchema) {
  const out = { breaking: [], features: [] };
  if (!oldSchema || !oldSchema.properties || !newSchema || !newSchema.properties) return out;
  const before = oldSchema.properties;
  const after = newSchema.properties;
  for (const name of Object.keys(before)) {
    if (!(name in after)) {
      out.breaking.push('opzione rimossa: ' + name);
      continue;
    }
    const b = before[name];
    const a = after[name];
    if (Array.isArray(b.enum)) {
      const gone = b.enum.filter((v) => !(a.enum || []).includes(v));
      if (gone.length) out.breaking.push('valori rimossi da ' + name + ': ' + gone.join(', '));
      const added = (a.enum || []).filter((v) => !b.enum.includes(v));
      if (added.length) out.features.push('nuovi valori per ' + name + ': ' + added.join(', '));
    }
    if (b.default !== undefined && JSON.stringify(b.default) !== JSON.stringify(a.default)) {
      out.breaking.push('default cambiato per ' + name + ': ' + JSON.stringify(b.default) + ' -> ' + JSON.stringify(a.default));
    }
  }
  for (const name of Object.keys(after)) {
    if (!(name in before)) out.features.push('nuova opzione: ' + name);
  }
  return out;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Decide il livello di aumento della versione.
 * @param commits :messaggi di commit (stringhe) dall'ultima versione rilasciata
 * @param schema  :risultato di diffSchema
 * @returns { level, reasons } con level in major|minor|patch|none e i motivi della scelta
 */
function decideBump(commits, schema) {
  const parsed = (commits || []).map(parseCommit);
  const reasons = [];
  const breaking = parsed.filter((c) => c.breaking);
  const feats = parsed.filter((c) => c.type === 'feat');
  breaking.forEach((c) => reasons.push('MAJOR: ' + c.type + (c.scope ? '(' + c.scope + ')' : '') + ': ' + c.subject));
  ((schema && schema.breaking) || []).forEach((r) => reasons.push('MAJOR: schema ' + r));
  if (breaking.length || ((schema && schema.breaking) || []).length) return { level: 'major', reasons };
  feats.forEach((c) => reasons.push('MINOR: feat: ' + c.subject));
  ((schema && schema.features) || []).forEach((r) => reasons.push('MINOR: schema ' + r));
  if (feats.length || ((schema && schema.features) || []).length) return { level: 'minor', reasons };
  if (parsed.length) {
    parsed.slice(0, 8).forEach((c) => reasons.push('PATCH: ' + (c.type === 'other' ? '' : c.type + ': ') + c.subject));
    return { level: 'patch', reasons };
  }
  return { level: 'none', reasons: ['nessun commit dall\'ultima versione rilasciata'] };
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Genera la sezione di CHANGELOG per una versione, raggruppando i commit per tipo.
 * @param version :versione rilasciata
 * @param date    :data (YYYY-MM-DD)
 * @param commits :messaggi di commit
 * @param schema  :risultato di diffSchema
 * @returns testo markdown della sezione
 */
function buildChangelogSection(version, date, commits, schema) {
  const parsed = (commits || []).map(parseCommit);
  const pick = (fn) => parsed.filter(fn).map((c) => '- ' + c.subject);
  const groups = [
    ['BREAKING CHANGE', parsed.filter((c) => c.breaking).map((c) => '- ' + c.subject).concat(((schema && schema.breaking) || []).map((r) => '- schema: ' + r))],
    ['Aggiunto', pick((c) => c.type === 'feat' && !c.breaking).concat(((schema && schema.features) || []).map((r) => '- schema: ' + r))],
    ['Corretto', pick((c) => (c.type === 'fix' || c.type === 'perf') && !c.breaking)],
    ['Altro', pick((c) => !['feat', 'fix', 'perf'].includes(c.type) && !c.breaking && c.type !== 'other').concat(pick((c) => c.type === 'other' && !c.breaking))],
  ];
  let out = '## ' + version + ' (' + date + ')\n';
  for (const [title, items] of groups) {
    if (!items.length) continue;
    out += '\n### ' + title + '\n\n' + Array.from(new Set(items)).join('\n') + '\n';
  }
  return out;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Esegue un comando e ne restituisce l'esito.
 * @param cmd  :comando
 * @param args :argomenti
 * @param opts :opzioni di spawnSync (cwd, stdio)
 * @returns { ok, out, err, status }
 */
function run(cmd, args, opts) {
  // git senza shell: gli argomenti (messaggi di commit, -S"...") restano intatti; npm su Windows e' un .cmd e vuole la shell
  const r = spawnSync(cmd, args, Object.assign({ cwd: REPO, shell: cmd !== 'git', encoding: 'utf8' }, opts || {}));
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), status: r.status };
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Legge la versione pubblicata su npm.
 * @param name :nome del pacchetto
 * @returns la versione oppure null se il pacchetto non e' pubblicato
 */
function registryVersion(name) {
  const r = run('npm', ['view', name, 'version']);
  if (r.ok && r.out) return r.out.split(/\r?\n/).pop().trim();
  if (/E404|404/.test(r.err + r.out)) return null;
  throw new Error('Impossibile leggere la versione dal registry npm: ' + (r.err || r.out));
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Trova il riferimento git da cui contare i commit dell'ultima versione rilasciata: il tag v<versione> se esiste,
 * altrimenti il commit che ha introdotto quella versione in package.json.
 * @param version :ultima versione rilasciata
 * @returns riferimento git (tag o hash) oppure null
 */
function baseRef(version) {
  if (run('git', ['rev-parse', '-q', '--verify', 'refs/tags/v' + version]).ok) return 'v' + version;
  const r = run('git', ['log', '-1', '--format=%H', '-S"version": "' + version + '"', '--', 'package.json']);
  return r.ok && r.out ? r.out : null;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Elenca i messaggi di commit tra un riferimento e HEAD, esclusi i merge.
 * @param ref :riferimento di partenza (null = tutta la storia)
 * @returns array di messaggi completi
 */
function commitsSince(ref) {
  const range = ref ? [ref + '..HEAD'] : [];
  const r = run('git', ['log', '--no-merges', '--format=%B%x1e'].concat(range));
  if (!r.ok) throw new Error('git log fallito: ' + r.err);
  return r.out.split('\x1e').map((s) => s.trim()).filter(Boolean);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Legge lo schema delle opzioni a un riferimento git.
 * @param ref :riferimento git
 * @returns lo schema (oggetto) oppure null
 */
function schemaAt(ref) {
  if (!ref) return null;
  const r = run('git', ['show', ref + ':' + SCHEMA]);
  if (!r.ok) return null;
  try { return JSON.parse(r.out); } catch (e) { return null; }
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Interpreta gli argomenti da riga di comando.
 * @param argv :argomenti (process.argv.slice(2))
 * @returns oggetto con le opzioni
 */
function parseArgs(argv) {
  const args = { yes: false, bump: null, dryRun: false, push: true, skipTests: false, tag: 'latest', allowBranch: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--no-push') args.push = false;
    else if (a === '--skip-tests') args.skipTests = true;
    else if (a === '--allow-branch') args.allowBranch = true;
    else if (a === '--bump') args.bump = argv[++i];
    else if (a === '--tag') args.tag = argv[++i];
    else throw new Error('Opzione sconosciuta: ' + a);
  }
  if (args.bump && !['major', 'minor', 'patch'].includes(args.bump)) throw new Error('--bump deve essere major, minor o patch');
  return args;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Interrompe il rilascio con un messaggio.
 * @param msg :motivo
 */
function fail(msg) {
  console.error('\nRILASCIO INTERROTTO: ' + msg);
  process.exit(1);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Calcola il piano di rilascio senza modificare nulla.
 * @param args :opzioni
 * @returns { name, local, registry, version, level, reasons, firstRelease, base, commits, schema }
 */
function plan(args) {
  const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
  const registry = registryVersion(pkg.name);
  const local = pkg.version;
  const result = { name: pkg.name, local, registry, version: local, level: 'none', reasons: [], firstRelease: false, base: null, commits: [], schema: { breaking: [], features: [] } };

  if (!registry || compareVersions(local, registry) > 0) {
    result.firstRelease = true;
    result.reasons.push('la versione ' + local + ' non e\' ancora sul registry' + (registry ? ' (ultima pubblicata: ' + registry + ')' : '') + ': si pubblica cosi\' com\'e\'');
    if (!args.bump) return result;
  }

  const from = result.firstRelease ? local : (compareVersions(local, registry) >= 0 ? local : registry);
  result.base = baseRef(from);
  result.commits = commitsSince(result.base);
  result.schema = diffSchema(schemaAt(result.base), JSON.parse(fs.readFileSync(path.join(REPO, SCHEMA), 'utf8')));
  const decision = decideBump(result.commits, result.schema);
  result.level = args.bump || decision.level;
  result.reasons = args.bump ? ['forzato con --bump ' + args.bump].concat(decision.reasons) : decision.reasons;
  result.firstRelease = false;
  if (result.level === 'none') return result;
  result.version = bumpVersion(from, result.level);
  return result;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Punto di ingresso: controlli, piano e (con --yes) rilascio.
 */
function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log('== Rilascio pl-schematics ==');

  const status = run('git', ['status', '--porcelain']);
  if (status.out) fail('ci sono modifiche non committate:\n' + status.out);
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']).out;
  if (branch !== 'main' && !args.allowBranch) fail('sei su "' + branch + '", non su main (usa --allow-branch per forzare)');
  const who = run('npm', ['whoami']);
  if (!who.ok) fail('npm non autenticato (npm whoami fallisce). Imposta un token con: npm config set //registry.npmjs.org/:_authToken <TOKEN>');

  const p = plan(args);
  if (p.level === 'none' && !p.firstRelease) fail(p.reasons.join(' '));
  console.log('Utente npm        : ' + who.out);
  console.log('Branch            : ' + branch);
  console.log('Versione locale   : ' + p.local + '   su npm: ' + (p.registry || '(non pubblicato)'));
  console.log('Commit analizzati : ' + p.commits.length + (p.base ? ' (da ' + p.base.slice(0, 9) + ')' : ''));
  console.log('Decisione         : ' + (p.firstRelease ? 'nessun aumento' : p.level.toUpperCase()) + '  ->  pubblicherei ' + p.name + '@' + p.version);
  p.reasons.forEach((r) => console.log('  - ' + r));

  if (!args.yes) {
    console.log('\nNon ho pubblicato nulla. Per procedere: node tools/publish.js --yes   (prova senza pubblicare: --yes --dry-run)');
    return;
  }

  if (!args.skipTests) {
    console.log('\n> npm test');
    if (!run('npm', ['test'], { stdio: 'inherit' }).ok) fail('i test non passano');
  }

  const bumped = p.version !== p.local;
  if (bumped) {
    console.log('\n> aggiornamento versione ' + p.local + ' -> ' + p.version);
    if (!run('npm', ['version', p.version, '--no-git-tag-version', '--allow-same-version']).ok) fail('npm version fallito');
    const clPath = path.join(REPO, 'CHANGELOG.md');
    if (fs.existsSync(clPath)) {
      const cl = fs.readFileSync(clPath, 'utf8');
      const section = buildChangelogSection(p.version, new Date().toISOString().slice(0, 10), p.commits, p.schema);
      const eol = cl.includes('\r\n') ? '\r\n' : '\n';
      const marker = cl.search(/^## /m);
      const next = marker >= 0 ? cl.slice(0, marker) + section.replace(/\n/g, eol) + eol + cl.slice(marker) : cl + eol + section.replace(/\n/g, eol);
      fs.writeFileSync(clPath, next);
    }
    run('git', ['add', '-A']);
    if (!run('git', ['commit', '-m', 'chore(release): v' + p.version]).ok) fail('commit di rilascio fallito');
  }

  console.log('\n> npm publish' + (args.dryRun ? ' --dry-run' : '') + ' (tag ' + args.tag + ')');
  const pub = run('npm', ['publish', '--access', 'public', '--tag', args.tag].concat(args.dryRun ? ['--dry-run'] : []), { stdio: 'inherit' });
  if (!pub.ok) fail('npm publish fallito' + (bumped ? '. Il commit di versione e\' stato fatto in locale: annullalo con git reset --hard HEAD~1 prima di riprovare' : ''));

  if (args.dryRun) { console.log('\nDRY-RUN completato: nessun tag, nessun push.'); return; }

  run('git', ['tag', '-a', 'v' + p.version, '-m', 'v' + p.version]);
  if (args.push) {
    console.log('\n> git push (main, master, tag)');
    run('git', ['push', 'origin', branch], { stdio: 'inherit' });
    run('git', ['push', 'origin', branch + ':master'], { stdio: 'inherit' });
    run('git', ['push', 'origin', 'v' + p.version], { stdio: 'inherit' });
  }
  console.log('\nPUBBLICATO ' + p.name + '@' + p.version);
}

module.exports = { compareVersions, bumpVersion, parseCommit, diffSchema, decideBump, buildChangelogSection, parseArgs };

if (require.main === module) {
  try { main(); } catch (e) { fail(e.message); }
}
