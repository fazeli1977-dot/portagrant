import test from 'node:test';
import assert from 'node:assert/strict';
import { deploymentPolicy, verifyDeploymentNetwork, verifyDeploymentFee } from './deploy-policy.mjs';

const config = {
  EXPECTED_GENESIS_HASH: `0x${'ab'.repeat(32)}`,
  DEPLOY_STORAGE_LIMIT: '100000', DEPLOY_GAS_REF_TIME: '1000000000',
  DEPLOY_GAS_PROOF_SIZE: '100000', DEPLOY_MAX_ESTIMATED_FEE: '9007199254740993'
};

test('deployment defaults to read-only preflight and requires explicit broadcast', () => {
  assert.equal(deploymentPolicy(config).broadcast, false);
  assert.equal(deploymentPolicy({ ...config, DEPLOY_BROADCAST: 'yes' }).broadcast, true);
  assert.throws(() => deploymentPolicy({ ...config, DEPLOY_BROADCAST: 'true' }), /exactly yes/);
});

test('deployment rejects missing or malformed independently pinned genesis', () => {
  for (const genesis of [undefined, '', 'mainnet', '0x1234']) {
    assert.throws(() => deploymentPolicy({ ...config, EXPECTED_GENESIS_HASH: genesis }), /genesis/);
  }
});

test('all resource limits require bounded positive integers without precision loss', () => {
  for (const name of Object.keys(config).filter(name => name !== 'EXPECTED_GENESIS_HASH')) {
    for (const value of [undefined, '', '0', '-1', '1.5', '1e6', ' 1', '18446744073709551616']) {
      assert.throws(() => deploymentPolicy({ ...config, [name]: value }), /positive u64/);
    }
  }
  assert.equal(deploymentPolicy(config).DEPLOY_MAX_ESTIMATED_FEE, '9007199254740993');
});

test('wrong chain and unsupported runtime fail before building a transaction', () => {
  const policy = deploymentPolicy(config);
  const api = { genesisHash: { toHex: () => config.EXPECTED_GENESIS_HASH }, tx: { contracts: { instantiateWithCode() {} } } };
  assert.doesNotThrow(() => verifyDeploymentNetwork(api, policy));
  assert.throws(() => verifyDeploymentNetwork({ ...api, genesisHash: { toHex: () => `0x${'cd'.repeat(32)}` } }, policy), /mismatch/);
  assert.throws(() => verifyDeploymentNetwork({ ...api, tx: {} }, policy), /runtime/);
});

test('estimated fee ceiling compares exact atomic amounts', () => {
  const policy = deploymentPolicy(config);
  assert.doesNotThrow(() => verifyDeploymentFee('9007199254740993', policy));
  assert.throws(() => verifyDeploymentFee('9007199254740994', policy), /exceeds/);
});
