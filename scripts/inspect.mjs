import fs from 'node:fs/promises';
import process from 'node:process';
import 'dotenv/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { inspectGrant, parseGrantId } from './inspect-grant.mjs';

const required = ['PORTALDOT_WS', 'CONTRACT_METADATA', 'CONTRACT_ADDRESS', 'QUERY_ORIGIN'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Set ${missing.join(', ')} in .env`);

const grantId = parseGrantId(process.env.GRANT_ID);
const metadata = JSON.parse(await fs.readFile(process.env.CONTRACT_METADATA, 'utf8'));
const api = await ApiPromise.create({ provider: new WsProvider(process.env.PORTALDOT_WS) });
let contract;
try {
  contract = new ContractPromise(api, metadata, process.env.CONTRACT_ADDRESS);
} catch (error) {
  await api.disconnect();
  throw error;
}
console.log(JSON.stringify(await inspectGrant(api, contract, process.env.QUERY_ORIGIN, grantId), null, 2));
