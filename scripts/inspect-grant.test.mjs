import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectGrant, parseGrantId } from './inspect-grant.mjs';

test('grant IDs preserve the full u64 range without rounding', () => {
  assert.equal(parseGrantId(), '0');
  assert.equal(parseGrantId('0007'), '7');
  assert.equal(parseGrantId('9007199254740993'), '9007199254740993');
  assert.equal(parseGrantId('18446744073709551615'), '18446744073709551615');
});

test('invalid and overflowing grant IDs are rejected', () => {
  for (const value of ['', ' ', '-1', '+1', '1.5', '1e3', '0xff', 'NaN', '1\n', null, 7, '18446744073709551616']) {
    assert.throws(() => parseGrantId(value), /unsigned 64-bit decimal integer/);
  }
});

function fixture(responses) {
  const calls = [];
  let disconnects = 0;
  const api = { disconnect: async () => { disconnects += 1; } };
  const query = Object.fromEntries(['getGrant', 'getMilestones'].map(method => [method, async (...args) => {
    calls.push({ method, args });
    const response = responses[method];
    if (response instanceof Error) throw response;
    return response;
  }]));
  return { api, contract: { query }, calls, disconnects: () => disconnects };
}

const success = value => ({ result: { isOk: true }, output: { toHuman: () => value } });

test('reads both methods with exact IDs and disconnects', async () => {
  const context = fixture({ getGrant: success({ total: '150' }), getMilestones: success([{ amount: '150' }]) });
  const grantId = parseGrantId('18446744073709551615');
  assert.deepEqual(await inspectGrant(context.api, context.contract, 'origin', grantId), {
    grant: { total: '150' }, milestones: [{ amount: '150' }]
  });
  assert.deepEqual(context.calls, ['getGrant', 'getMilestones'].map(method => ({
    method, args: ['origin', { gasLimit: -1 }, grantId]
  })));
  assert.equal(context.disconnects(), 1);
});

for (const method of ['getGrant', 'getMilestones']) {
  test(`disconnects and reports dispatch failure in ${method}`, async () => {
    const context = fixture({
      getGrant: success(null), getMilestones: success(null),
      [method]: { result: { isOk: false, toString: () => 'dispatch error' } }
    });
    await assert.rejects(inspectGrant(context.api, context.contract, 'origin', '0'), new RegExp(`${method} failed: dispatch error`));
    assert.equal(context.disconnects(), 1);
    assert.equal(context.calls.length, method === 'getGrant' ? 1 : 2);
  });

  test(`disconnects after rejected RPC in ${method}`, async () => {
    const context = fixture({ getGrant: success(null), getMilestones: success(null), [method]: new Error('RPC unavailable') });
    await assert.rejects(inspectGrant(context.api, context.contract, 'origin', '0'), /RPC unavailable/);
    assert.equal(context.disconnects(), 1);
  });
}

test('missing output is represented as null', async () => {
  const context = fixture({ getGrant: { result: { isOk: true } }, getMilestones: success(null) });
  assert.deepEqual(await inspectGrant(context.api, context.contract, 'origin', '0'), { grant: null, milestones: null });
  assert.equal(context.disconnects(), 1);
});

test('disconnects when output decoding throws', async () => {
  const context = fixture({
    getGrant: { result: { isOk: true }, output: { toHuman: () => { throw new Error('decode failed'); } } }
  });
  await assert.rejects(inspectGrant(context.api, context.contract, 'origin', '0'), /decode failed/);
  assert.equal(context.disconnects(), 1);
});
