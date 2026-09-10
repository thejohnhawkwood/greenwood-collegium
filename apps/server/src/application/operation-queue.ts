export type RunExclusive = <T>(operation: () => Promise<T>) => Promise<T>;

// One authoritative process: admission, moderation and gameplay mutations share
// this queue so a reset cannot interleave with a command or invite redemption.
export function createOperationQueue(): RunExclusive {
  let tail = Promise.resolve();
  return <T>(operation: () => Promise<T>): Promise<T> => {
    const result = tail.then(operation);
    tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
}
