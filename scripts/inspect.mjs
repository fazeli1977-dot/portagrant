import fs from 'node:fs/promises';
import process from 'node:process';
import 'dotenv/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

const required = ['PORTALDOT_WS', 'CONTRACT_METADATA', 'CONTRACT_ADDRESS', 'QUERY_ORIGIN'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Set ${missing.join(', ')} in .env`);

const api = await ApiPromise.create({ provider: new WsProvider(process.env.PORTALDOT_WS) });
const metadata = JSON.parse(await fs.readFile(process.env.CONTRACT_METADATA, 'utf8'));
const contract = new ContractPromise(api, metadata, process.env.CONTRACT_ADDRESS);
const grantId = Number(process.env.GRANT_ID || 0);
if (!Number.isSafeInteger(grantId) || grantId < 0) throw new Error('GRANT_ID must be a non-negative safe integer');

const query = async method => {
  const { result, output } = await contract.query[method](process.env.QUERY_ORIGIN, { gasLimit: -1 }, grantId);
  if (!result.isOk) throw new Error(`${method} failed: ${result.toString()}`);
  return output?.toHuman() ?? null;
};

console.log(JSON.stringify({ grant: await query('getGrant'), milestones: await query('getMilestones') }, null, 2));
await api.disconnect();
