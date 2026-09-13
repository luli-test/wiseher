const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const envPath = path.resolve('.env');
const backupPath = path.resolve('.env.backup');

let moved = false;
try {
  if (fs.existsSync(envPath)) {
    fs.renameSync(envPath, backupPath);
    moved = true;
  }
  console.log('Building clean production bundle...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Publishing to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });
  console.log('Successfully deployed to GitHub Pages: https://luli-test.github.io/wiseher/');
} finally {
  if (moved && fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, envPath);
    console.log('Restored .env for local development.');
  }
}
