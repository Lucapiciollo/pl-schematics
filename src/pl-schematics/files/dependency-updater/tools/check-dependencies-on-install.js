/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFileSync } = require('child_process');

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const IGNORE_FILE_PATH = path.join(process.cwd(), '.pl-deps-ignore.json');

const DEPENDENCY_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function isCi() {
  return (
    process.env.CI === 'true' ||
    process.env.TF_BUILD === 'True' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.BUILD_BUILDID !== undefined
  );
}

function isInteractiveTerminal() {
  return !!process.stdin.isTTY && !!process.stdout.isTTY;
}

function shouldSkip() {
  const value = String(process.env.PL_DEPS_CHECK || '').toLowerCase();

  return (
    value === 'false' ||
    value === '0' ||
    value === 'no' ||
    value === 'off'
  );
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(value, null, 2) + '\n',
    'utf8',
  );
}

function normalizeVersion(version) {
  if (!version) {
    return '';
  }

  return String(version)
    .replace(/^[\^~><=\s]+/, '')
    .replace(/^v/, '')
    .trim();
}

function isNonRegistryVersion(version) {
  if (!version) {
    return true;
  }

  const value = String(version);

  return (
    value.startsWith('file:') ||
    value.startsWith('link:') ||
    value.startsWith('workspace:') ||
    value.startsWith('github:') ||
    value.startsWith('git+') ||
    value.startsWith('http:') ||
    value.startsWith('https:') ||
    value === '*' ||
    value === 'latest'
  );
}

function getVersionPrefix(version) {
  const value = String(version || '');

  if (value.startsWith('^')) {
    return '^';
  }

  if (value.startsWith('~')) {
    return '~';
  }

  return '^';
}

function parseSemver(version) {
  const clean = normalizeVersion(version);

  const parts = clean.split('.').map(function(part) {
    const parsed = parseInt(part.replace(/\D.*$/, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  });

  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function compareVersions(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);

  if (left.major !== right.major) {
    return left.major - right.major;
  }

  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }

  return left.patch - right.patch;
}

function getLatestVersion(packageName) {
  try {
    return execFileSync(
      npmCommand,
      ['view', packageName + '@latest', 'version'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();
  } catch (error) {
    return null;
  }
}

function collectDependencies(packageJson, ignoredPackages) {
  const result = [];

  DEPENDENCY_SECTIONS.forEach(function(section) {
    const dependencies = packageJson[section];

    if (!dependencies) {
      return;
    }

    Object.keys(dependencies).forEach(function(packageName) {
      const currentVersion = dependencies[packageName];

      if (ignoredPackages.indexOf(packageName) >= 0) {
        return;
      }

      if (isNonRegistryVersion(currentVersion)) {
        return;
      }

      result.push({
        section: section,
        name: packageName,
        currentVersion: currentVersion,
      });
    });
  });

  return result;
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(function(resolve) {
    rl.question(question, function(answer) {
      rl.close();
      resolve(String(answer || '').trim().toLowerCase());
    });
  });
}

function applyUpdate(packageJson, update) {
  const prefix = getVersionPrefix(update.currentVersion);
  const nextVersion = prefix + update.latestVersion;

  packageJson[update.section][update.name] = nextVersion;

  console.log(
    '[PL deps] Aggiornato: ' +
      update.name +
      ' ' +
      update.currentVersion +
      ' -> ' +
      nextVersion,
  );
}

async function main() {
  if (shouldSkip()) {
    return;
  }

  if (isCi()) {
    console.log('[PL deps] CI rilevata: controllo dipendenze saltato.');
    return;
  }

  if (!isInteractiveTerminal()) {
    console.log('[PL deps] Terminale non interattivo: controllo dipendenze saltato.');
    return;
  }

  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    return;
  }

  const packageJson = readJson(PACKAGE_JSON_PATH, null);

  if (!packageJson) {
    return;
  }

  const ignoreConfig = readJson(IGNORE_FILE_PATH, {
    ignoredPackages: [],
  });

  if (!Array.isArray(ignoreConfig.ignoredPackages)) {
    ignoreConfig.ignoredPackages = [];
  }

  const firstAnswer = await ask(
    '\n[PL deps] Vuoi controllare aggiornamenti librerie npm durante installazione? [y/n] ',
  );

  if (firstAnswer !== 'y') {
    console.log('[PL deps] Controllo aggiornamenti saltato.');
    return;
  }

  const dependencies = collectDependencies(
    packageJson,
    ignoreConfig.ignoredPackages,
  );

  if (dependencies.length === 0) {
    console.log('[PL deps] Nessuna dipendenza da controllare.');
    return;
  }

  console.log('');
  console.log('[PL deps] Controllo versioni disponibili su npm...');
  console.log('');

  const updates = [];

  dependencies.forEach(function(dependency) {
    const latestVersion = getLatestVersion(dependency.name);

    if (!latestVersion) {
      console.log('[PL deps] WARN: impossibile controllare ' + dependency.name);
      return;
    }

    const currentClean = normalizeVersion(dependency.currentVersion);

    if (compareVersions(latestVersion, currentClean) > 0) {
      updates.push({
        section: dependency.section,
        name: dependency.name,
        currentVersion: dependency.currentVersion,
        latestVersion: latestVersion,
      });
    }
  });

  if (updates.length === 0) {
    console.log('[PL deps] Tutte le dipendenze sono aggiornate.');
    return;
  }

  console.log('[PL deps] Aggiornamenti disponibili:');
  console.log('');

  updates.forEach(function(update) {
    console.log(
      '- ' +
        update.name +
        ' [' +
        update.section +
        '] ' +
        update.currentVersion +
        ' -> ' +
        update.latestVersion,
    );
  });

  console.log('');
  console.log('Scelte:');
  console.log('  y = aggiorna questa libreria');
  console.log('  n = salta questa libreria');
  console.log('  a = aggiorna tutte le rimanenti');
  console.log('  i = ignora tutti gli aggiornamenti');
  console.log('  p = ignora sempre questa libreria');
  console.log('  q = esci');
  console.log('');

  let updateAll = false;
  let changed = false;

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];

    if (updateAll) {
      applyUpdate(packageJson, update);
      changed = true;
      continue;
    }

    const answer = await ask(
      'Aggiornare ' +
        update.name +
        ' da ' +
        update.currentVersion +
        ' a ' +
        update.latestVersion +
        '? [y/n/a/i/p/q] ',
    );

    if (answer === 'q') {
      console.log('[PL deps] Operazione interrotta.');
      break;
    }

    if (answer === 'i') {
      console.log('[PL deps] Tutti gli aggiornamenti rimanenti ignorati.');
      break;
    }

    if (answer === 'a') {
      updateAll = true;
      applyUpdate(packageJson, update);
      changed = true;
      continue;
    }

    if (answer === 'p') {
      if (ignoreConfig.ignoredPackages.indexOf(update.name) < 0) {
        ignoreConfig.ignoredPackages.push(update.name);
        writeJson(IGNORE_FILE_PATH, ignoreConfig);
      }

      console.log('[PL deps] Pacchetto ignorato permanentemente: ' + update.name);
      continue;
    }

    if (answer === 'y') {
      applyUpdate(packageJson, update);
      changed = true;
      continue;
    }

    console.log('[PL deps] Saltato: ' + update.name);
  }

  if (!changed) {
    console.log('');
    console.log('[PL deps] Nessuna modifica applicata a package.json.');
    return;
  }

  writeJson(PACKAGE_JSON_PATH, packageJson);

  console.log('');
  console.log('[PL deps] package.json aggiornato.');
  console.log('[PL deps] Esegui di nuovo npm install per installare le nuove versioni.');
  console.log('');
}

main().catch(function(error) {
  console.error('[PL deps] Errore controllo dipendenze:', error);
});