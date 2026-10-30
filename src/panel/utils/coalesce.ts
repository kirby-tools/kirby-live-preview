/**
 * Wraps an async task so a call made while it runs is kept instead of dropped:
 * once the run finishes, the task runs again with the latest of those calls'
 * arguments.
 */
export function coalesce<Args extends unknown[]>(
  task: (...args: Args) => Promise<void>,
) {
  let isRunning = false;
  let pendingArgs: Args | undefined;

  return async (...args: Args) => {
    if (isRunning) {
      pendingArgs = args;
      return;
    }

    isRunning = true;
    let nextArgs: Args | undefined = args;

    try {
      while (nextArgs) {
        pendingArgs = undefined;
        await task(...nextArgs);
        nextArgs = pendingArgs;
      }
    } finally {
      isRunning = false;
    }
  };
}
