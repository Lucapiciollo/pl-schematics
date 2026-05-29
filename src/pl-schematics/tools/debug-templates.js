const fs = require('fs');
const path = require('path');
const strings = require('@angular-devkit/core').strings;
const templateUtils = require('@angular-devkit/core/src/utils/template');

/**
 * Lo script può stare in:
 * - tools/debug-templates.js
 * - src/pl-schematics/tools/debug-templates.js
 *
 * Cerchiamo automaticamente la cartella files.
 */
const possibleRoots = [
  path.join(process.cwd(), 'src', 'pl-schematics', 'files'),
  path.join(__dirname, '..', 'files'),
  path.join(__dirname, '..', '..', 'pl-schematics', 'files'),
];

const root = possibleRoots.find((item) => fs.existsSync(item));

if (!root) {
  console.error('Cannot find templates folder.');
  console.error('Checked paths:');
  possibleRoots.forEach((item) => console.error(' - ' + item));
  process.exit(1);
}

console.log('Templates root:', root);

const options = {
  name: 'my-app-template',
  namePackage: 'my-app-template',
  nameCompany: 'PL',
  prefix: 'app',
  browserSupported: 'BROWSER.ALL',
  loginSupportConfiguration: 'NONE',
  addSupportBootstrap: 'Y',
  enableSonarQube: 'Y',
  architecture: 'classic',
  state: 'none',
  http: 'interceptor-classic',
  ui: 'bootstrap',
  i18n: 'ngx-translate',
  logging: 'advanced',
  mockApi: 'none',
  ci: 'none',
  tests: 'jasmine',
  docker: false,
  strict: false,
  ...strings,
};

function walk(dir) {
  const result = [];

  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      result.push(...walk(fullPath));
    } else {
      result.push(fullPath);
    }
  });

  return result;
}

function printContext(content) {
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const hasTemplate = line.indexOf('<%') >= 0 || line.indexOf('%>') >= 0;
    const hasElse = line.indexOf('else') >= 0;
    const hasIf = line.indexOf('if') >= 0;

    if (hasTemplate || hasElse || hasIf) {
      console.log(`${index + 1}: ${line}`);
    }
  });
}

const files = walk(root);

let hasError = false;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');

  try {
    templateUtils.template(content, options);
  } catch (error) {
    hasError = true;

    console.log('\n====================================');
    console.log('BROKEN TEMPLATE');
    console.log(file);
    console.log('ERROR:', error.message);
    console.log('---- CONTEXT ----');
    printContext(content);
    console.log('====================================\n');
  }
});

if (!hasError) {
  console.log('All templates compiled successfully.');
}