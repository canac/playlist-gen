// Handle exceptions from a promise
export function handleAsyncErrors(promise: Promise<unknown>) {
  promise.catch((err) => {
    console.error(err);
  });
}

// Return a promise that resolves to true if the promise resolves, false if the promise rejects
export async function resolves(promise: Promise<unknown>): Promise<boolean> {
  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
}
