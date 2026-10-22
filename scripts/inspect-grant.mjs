export function parseGrantId(value = '0') {
  if (typeof value !== 'string' || value.length === 0 || /[^0-9]/.test(value) || BigInt(value) > 18446744073709551615n) {
    throw new Error('GRANT_ID must be an unsigned 64-bit decimal integer');
  }
  return BigInt(value).toString();
}

export async function inspectGrant(api, contract, origin, grantId) {
  try {
    const query = async method => {
      const { result, output } = await contract.query[method](origin, { gasLimit: -1 }, grantId);
      if (!result.isOk) throw new Error(`${method} failed: ${result.toString()}`);
      return output?.toHuman() ?? null;
    };
    return { grant: await query('getGrant'), milestones: await query('getMilestones') };
  } finally {
    await api.disconnect();
  }
}
