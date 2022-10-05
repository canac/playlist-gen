// Handle exceptions from a promise
export function handleAsyncErrors(promise: Promise<unknown>) {
  promise.catch((err) => {
    console.error(err);
  });
}
