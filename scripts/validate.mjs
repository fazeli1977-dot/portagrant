import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptFiles = fs.readdirSync(path.join(root, 'scripts')).filter(name => name.endsWith('.mjs')).map(name => `scripts/${name}`);
const frontendFiles = fs.readdirSync(path.join(root, 'frontend')).filter(name => /\.(js|cjs)$/.test(name)).map(name => `frontend/${name}`);
const testFiles = [...scriptFiles, ...frontendFiles].filter(name => /\.test\.(mjs|cjs)$/.test(name));
const manifest = ['--manifest-path', 'contracts/portagrant/Cargo.toml'];
const checks = [
  ...[...scriptFiles, ...frontendFiles].map(name => [process.execPath, ['--check', name]]),
  [process.execPath, ['--test', ...testFiles]],
  [process.execPath, ['scripts/smoke.mjs']],
  ['cargo', ['+1.88.0', 'test', ...manifest, '--locked']],
  ['cargo', ['+1.88.0', 'clippy', ...manifest, '--locked', '--all-targets', '--', '-D', 'warnings']],
  ['cargo', ['+1.88.0', 'rustc', '--lib', ...manifest, '--locked', '--release', '--target', 'wasm32-unknown-unknown', '--no-default-features', '--crate-type=cdylib']],
  ['git', ['diff', '--check']]
];
for (const [command, args] of checks) {
  console.log(`\n> ${path.basename(command)} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('\nAll local validation checks passed. This does not verify live deployment.');
