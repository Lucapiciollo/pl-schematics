/* eslint-disable no-console */

const childProcess = require('child_process');

if (process.env.CI === 'true') {
  process.exit(0);
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  process.exit(0);
}

const answer = String(
  process.env.PL_CHECK_DEPENDENCIES || '',
).toLowerCase();

if (answer === 'false' || answer === '0' || answer === 'no') {
  process.exit(0);
}

console.log('');
console.log('Vuoi controllare aggiornamenti librerie?');
console.log('Esegui manualmente: npm run deps:check');
console.log('');