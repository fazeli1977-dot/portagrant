import fs from 'node:fs/promises';
import process from 'node:process';
import 'dotenv/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { CodePromise } from '@polkadot/api-contract';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { connectForDeployment, deploymentTimeout, waitForDeployment } from './deploy-transaction.mjs';

const required = ['PORTALDOT_WS', 'DEPLOYER_URI', 'CONTRACT_WASM', 'CONTRACT_METADATA'];
const missing = required.filter(name => !process.env[name]?.trim());
if (missing.length) throw new Error(`Set ${missing.join(', ')} in .env`);
const timeoutMs = deploymentTimeout(process.env.DEPLOY_TIMEOUT_MS);
const ws = new URL(process.env.PORTALDOT_WS);
if (!['ws:', 'wss:'].includes(ws.protocol)) throw new Error('PORTALDOT_WS must use ws:// or wss://');
if (ws.username || ws.password) throw new Error('Use an RPC URL without embedded credentials');
const wasm = await fs.readFile(process.env.CONTRACT_WASM);
const metadata = JSON.parse(await fs.readFile(process.env.CONTRACT_METADATA, 'utf8'));
if (!await cryptoWaitReady()) throw new Error('Could not initialize signing cryptography');
const keyring = new Keyring({ type: 'sr25519' });
const deployer = keyring.addFromUri(process.env.DEPLOYER_URI);
const provider = new WsProvider(ws.href, false);
let api;
try {
  api = await connectForDeployment(provider, () => ApiPromise.create({ provider, throwOnConnect: true }), timeoutMs);
  const code = new CodePromise(api, metadata, wasm);
  const gasLimit = api.registry.createType('WeightV2', { refTime: 1_000_000_000, proofSize: 100_000 });
  const tx = code.tx.new({ gasLimit, storageDepositLimit: null });
  console.error(`Deploying from ${deployer.address} to ${ws.origin}`);
  console.log(JSON.stringify(await waitForDeployment(tx, deployer, timeoutMs), null, 2));
} finally {
  if (api) await api.disconnect();
  else await provider.disconnect();
}
