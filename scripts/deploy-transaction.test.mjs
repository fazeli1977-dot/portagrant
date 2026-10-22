import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as tick } from 'node:timers/promises';
import { connectForDeployment, deploymentTimeout, waitForDeployment } from './deploy-transaction.mjs';

const signer = { address: 'test-signer' };
const finalized = () => ({
  status: { isFinalized: true, asFinalized: { toHex: () => '0xblock' } },
  contract: { address: { toString: () => 'test-contract' } },
  txHash: { toHex: () => '0xtx' }
});

function subscription() {
  let callback;
  let stops = 0;
  return {
    tx: { signAndSend: async (account, listener) => {
      assert.equal(account, signer);
      callback = listener;
      return () => { stops += 1; };
    } },
    emit: result => callback(result), stops: () => stops
  };
}

test('validates deployment timeouts', () => {
  assert.equal(deploymentTimeout(), 120000);
  assert.equal(deploymentTimeout('42'), 42);
  for (const value of ['0', '-1', '1.5', 'NaN', '2147483648']) {
    assert.throws(() => deploymentTimeout(value), /DEPLOY_TIMEOUT_MS/);
  }
});

test('connection and API initialization are bounded', async () => {
  assert.equal(await connectForDeployment({ connect: async () => {} }, async () => 'api', 100), 'api');
  await assert.rejects(connectForDeployment({ connect: () => new Promise(() => {}) }, async () => 'api', 5), /connection timed out/);
  await assert.rejects(connectForDeployment({ connect: async () => {} }, () => new Promise(() => {}), 5), /connection timed out/);
  await assert.rejects(connectForDeployment({ connect: async () => { throw new Error('offline'); } }, async () => 'api', 100), /offline/);
});

test('only reports finalized deployment, with block and signer evidence', async () => {
  const context = subscription();
  const pending = waitForDeployment(context.tx, signer, 1000);
  let settled = false;
  pending.then(() => { settled = true; });
  await tick();
  context.emit({ ...finalized(), status: { isInBlock: true } });
  await tick();
  assert.equal(settled, false);
  context.emit(finalized());
  const record = await pending;
  assert.equal(record.address, 'test-contract');
  assert.equal(record.txHash, '0xtx');
  assert.equal(record.blockHash, '0xblock');
  assert.equal(record.signer, signer.address);
  assert.ok(Number.isFinite(Date.parse(record.finalizedAt)));
  assert.equal(context.stops(), 1);
});

test('handles callback completing before unsubscribe is returned', async () => {
  let stops = 0;
  const tx = { signAndSend: async (account, callback) => {
    callback(finalized());
    return () => { stops += 1; };
  } };
  await waitForDeployment(tx, signer, 100);
  await tick();
  assert.equal(stops, 1);
});

test('expired connection does not initialize an API later', async () => {
  let connected;
  let creations = 0;
  const provider = { connect: () => new Promise(resolve => { connected = resolve; }) };
  await assert.rejects(connectForDeployment(provider, async () => { creations += 1; }, 5), /connection timed out/);
  connected();
  await tick();
  assert.equal(creations, 0);
});

test('late API initialization disconnects after connection timeout', async () => {
  let initialized;
  let stops = 0;
  const createApi = () => new Promise(resolve => { initialized = resolve; });
  await assert.rejects(connectForDeployment({ connect: async () => {} }, createApi, 5), /connection timed out/);
  initialized({ disconnect: async () => { stops += 1; } });
  await tick();
  assert.equal(stops, 1);
});

test('a subscribed transaction is unsubscribed when finality times out', async () => {
  const context = subscription();
  await assert.rejects(waitForDeployment(context.tx, signer, 5), /may still execute/);
  assert.equal(context.stops(), 1);
});

test('internal callback errors reject and clean up the subscription', async () => {
  const context = subscription();
  const pending = waitForDeployment(context.tx, signer, 1000);
  const rejected = assert.rejects(pending, /internal failure/);
  await tick();
  context.emit({ internalError: new Error('internal failure') });
  await rejected;
  assert.equal(context.stops(), 1);
});
for (const flag of ['isInvalid', 'isDropped', 'isUsurped', 'isFinalityTimeout']) {
  test(`rejects ${flag} and unsubscribes`, async () => {
    const context = subscription();
    const pending = waitForDeployment(context.tx, signer, 1000);
    const rejected = assert.rejects(pending, /Deployment stopped/);
    await tick();
    context.emit({ status: { [flag]: true, type: flag } });
    await rejected;
    assert.equal(context.stops(), 1);
  });
}

test('dispatch failure is reported and cleaned up', async () => {
  const context = subscription();
  const pending = waitForDeployment(context.tx, signer, 1000);
  const rejected = assert.rejects(pending, /Deployment failed: bad origin/);
  await tick();
  context.emit({ dispatchError: { toString: () => 'bad origin' } });
  await rejected;
  assert.equal(context.stops(), 1);
});

test('rejects finalization without an instantiated contract', async () => {
  const tx = { signAndSend: async (account, callback) => {
    callback({ ...finalized(), contract: null });
    return () => {};
  } };
  await assert.rejects(waitForDeployment(tx, signer, 100), /did not instantiate/);
});

test('rejects synchronous and asynchronous signing failures', async () => {
  for (const signAndSend of [() => { throw new Error('signing failed'); }, async () => { throw new Error('signing failed'); }]) {
    await assert.rejects(waitForDeployment({ signAndSend }, signer, 100), /signing failed/);
  }
});

test('timeout warns against blind retries and cleans up late unsubscribe', async () => {
  let returnUnsubscribe;
  let stops = 0;
  const tx = { signAndSend: () => new Promise(resolve => { returnUnsubscribe = resolve; }) };
  await assert.rejects(waitForDeployment(tx, signer, 5), /may still execute/);
  returnUnsubscribe(() => { stops += 1; });
  await tick();
  assert.equal(stops, 1);
});
