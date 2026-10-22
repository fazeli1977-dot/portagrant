export function deploymentPolicy(env) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(env.EXPECTED_GENESIS_HASH ?? '')) {
    throw new Error('Set EXPECTED_GENESIS_HASH to the independently verified testnet genesis hash');
  }
  const limits = {};
  for (const name of ['DEPLOY_STORAGE_LIMIT', 'DEPLOY_GAS_REF_TIME', 'DEPLOY_GAS_PROOF_SIZE', 'DEPLOY_MAX_ESTIMATED_FEE']) {
    const value = env[name] ?? '';
    if (!/^[1-9][0-9]*$/.test(value) || BigInt(value) > (1n << 64n) - 1n) {
      throw new Error(`${name} must be a positive u64 integer in atomic units`);
    }
    limits[name] = value;
  }
  if (env.DEPLOY_BROADCAST && env.DEPLOY_BROADCAST !== 'yes') {
    throw new Error('DEPLOY_BROADCAST must be unset or exactly yes');
  }
  return { genesis: env.EXPECTED_GENESIS_HASH.toLowerCase(), broadcast: env.DEPLOY_BROADCAST === 'yes', ...limits };
}

export function verifyDeploymentNetwork(api, policy) {
  if (api.genesisHash.toHex().toLowerCase() !== policy.genesis) {
    throw new Error('Genesis hash mismatch: refusing deployment on an unexpected network');
  }
  if (!api.tx.contracts?.instantiateWithCode) {
    throw new Error('Target runtime does not expose contracts.instantiateWithCode');
  }
}

export function verifyDeploymentFee(fee, policy) {
  if (BigInt(fee.toString()) > BigInt(policy.DEPLOY_MAX_ESTIMATED_FEE)) {
    throw new Error('Estimated transaction fee exceeds DEPLOY_MAX_ESTIMATED_FEE');
  }
}
