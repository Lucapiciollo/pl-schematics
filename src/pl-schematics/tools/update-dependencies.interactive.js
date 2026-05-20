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

function isWorkspaceOrFileVersion(version) {
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

      if (isWorkspaceOrFileVersion(currentVersion)) {
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

function printHeader() {
  console.log('');
  console.log('=================================================');
  console.log(' PL dependency updater');
  console.log('=================================================');
  console.log('');
}

function printHelp() {
  console.log('Scelte disponibili:');
  console.log('  y = aggiorna questa libreria');
  console.log('  n = salta questa libreria');
  console.log('  a = aggiorna tutte le rimanenti');
  console.log('  i = ignora tutti gli aggiornamenti');
  console.log('  p = ignora sempre questa libreria');
  console.log('  q = esci');
  console.log('');
}

async function main() {
  printHeader();

  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error('package.json non trovato nella cartella corrente.');
    process.exit(1);
  }

  const packageJson = readJson(PACKAGE_JSON_PATH, null);

  if (!packageJson) {
    console.error('package.json non valido.');
    process.exit(1);
  }

  const ignoreConfig = readJson(IGNORE_FILE_PATH, {
    ignoredPackages: [],
  });

  if (!Array.isArray(ignoreConfig.ignoredPackages)) {
    ignoreConfig.ignoredPackages = [];
  }

  const dependencies = collectDependencies(
    packageJson,
    ignoreConfig.ignoredPackages,
  );

  if (dependencies.length === 0) {
    console.log('Nessuna dipendenza da controllare.');
    return;
  }

  console.log('Controllo versioni npm...');
  console.log('');

  const updates = [];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    const latestVersion = getLatestVersion(dependency.name);

    if (!latestVersion) {
      console.log('WARN: impossibile controllare ' + dependency.name);
      continue;
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
  }

  if (updates.length === 0) {
    console.log('Tutte le dipendenze sono aggiornate.');
    return;
  }

  console.log('Aggiornamenti disponibili:');
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
  printHelp();

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
      console.log('Operazione interrotta.');
      break;
    }

    if (answer === 'i') {
      console.log('Aggiornamenti ignorati.');
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

      console.log('Pacchetto ignorato permanentemente: ' + update.name);
      continue;
    }

    if (answer === 'y') {
      applyUpdate(packageJson, update);
      changed = true;
      continue;
    }

    console.log('Saltato: ' + update.name);
  }

  if (!changed) {
    console.log('');
    console.log('Nessuna modifica applicata a package.json.');
    return;
  }

  writeJson(PACKAGE_JSON_PATH, packageJson);

  console.log('');
  console.log('package.json aggiornato.');
  console.log('');
  console.log('Ora esegui:');
  console.log('');
  console.log('  npm install');
  console.log('');
}

function applyUpdate(packageJson, update) {
  const prefix = getVersionPrefix(update.currentVersion);
  const nextVersion = prefix + update.latestVersion;

  packageJson[update.section][update.name] = nextVersion;

  console.log(
    'Aggiornato: ' +
      update.name +
      ' ' +
      update.currentVersion +
      ' -> ' +
      nextVersion,
  );
}

main().catch(function(error) {
  console.error(error);
  process.exit(1);
});