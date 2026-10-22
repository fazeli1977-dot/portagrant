import assert from 'node:assert/strict';
import fs from 'node:fs';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Abi, CodePromise, ContractPromise } from '@polkadot/api-contract';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

assert.ok(ApiPromise && WsProvider && CodePromise && ContractPromise);
assert.equal(await cryptoWaitReady(), true);
const signer = new Keyring({ type: 'sr25519' }).addFromUri('//Alice');
assert.ok(signer.address);
console.log('Dependency imports and local sr25519 initialization passed; no network or transaction used.');

const emptyConfig = Object.fromEntries([
  'PORTALDOT_WS', 'DEPLOYER_URI', 'CONTRACT_WASM', 'CONTRACT_METADATA', 'CONTRACT_ADDRESS', 'QUERY_ORIGIN'
].map(name => [name, '']));
for (const script of ['deploy.mjs', 'inspect.mjs']) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url))], {
    env: { ...process.env, ...emptyConfig }, encoding: 'utf8', timeout: 10000
  });
  if (result.error) throw result.error;
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Set PORTALDOT_WS/);
}
console.log('Deployment and inspection entrypoints reject missing configuration before connecting.');

const bundle = JSON.parse(fs.readFileSync(new URL('../artifacts/portagrant.contract', import.meta.url), 'utf8'));
assert.ok(bundle.source.wasm.startsWith('0x0061736d'));
const abi = new Abi(bundle);
assert.ok(abi.constructors.some(item => item.method === 'new'));
for (const method of ['createGrant', 'submitEvidence', 'approveMilestone', 'getGrant', 'getMilestones', 'getMilestone']) {
  assert.ok(abi.messages.some(item => item.method === method), method);
}
console.log('Committed release bundle ABI and embedded WASM verified.');
