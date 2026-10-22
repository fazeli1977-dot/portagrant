export function deploymentTimeout(value = '120000') {
  const timeout = Number(value);
  if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 2147483647) {
    throw new Error('DEPLOY_TIMEOUT_MS must be an integer between 1 and 2147483647');
  }
  return timeout;
}

export async function connectForDeployment(provider, createApi, timeoutMs) {
  let timer;
  let expired = false;
  try {
    return await Promise.race([
      Promise.resolve().then(() => provider.connect()).then(() => {
        if (expired) throw new Error('RPC connection timed out');
        return createApi();
      }).then(async api => {
        if (expired) {
          await api.disconnect();
          throw new Error('RPC connection timed out');
        }
        return api;
      }),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          expired = true;
          reject(new Error('RPC connection timed out'));
        }, timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function waitForDeployment(tx, signer, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    let finished = false;
    let unsubscribe;
    const cleanup = () => {
      clearTimeout(timer);
      if (unsubscribe) {
        const stop = unsubscribe;
        unsubscribe = undefined;
        stop();
      }
    };
    const finish = (error, record) => {
      if (finished) return;
      finished = true;
      try {
        cleanup();
      } catch (cleanupError) {
        reject(error ?? cleanupError);
        return;
      }
      if (error) reject(error);
      else resolve(record);
    };
    const timer = setTimeout(() => finish(new Error(
      'Deployment finality timed out; the transaction may still execute. Check the chain before retrying.'
    )), timeoutMs);

    Promise.resolve().then(() => tx.signAndSend(signer, result => {
      if (finished) return;
      try {
        if (result.dispatchError) throw new Error(`Deployment failed: ${result.dispatchError.toString()}`);
        if (result.internalError) throw result.internalError;
        const status = result.status;
        if (status.isInvalid || status.isDropped || status.isUsurped || status.isFinalityTimeout) {
          throw new Error(`Deployment stopped: ${status.type}; check the chain before retrying`);
        }
        if (!status.isFinalized) return;
        if (!result.contract?.address) throw new Error('Finalized transaction did not instantiate a contract');
        finish(null, {
          address: result.contract.address.toString(),
          txHash: result.txHash.toHex(),
          blockHash: status.asFinalized.toHex(),
          finalizedAt: new Date().toISOString(),
          signer: signer.address
        });
      } catch (error) {
        finish(error);
      }
    })).then(stop => {
      unsubscribe = stop;
      if (finished) cleanup();
    }).catch(error => finish(error));
  });
}
