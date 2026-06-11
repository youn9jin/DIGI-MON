const DEFAULT_MINIMUM_PENDING_MS = 1200;

export async function waitForMinimumPendingTime(
  startedAt: number,
  minimumMs = DEFAULT_MINIMUM_PENDING_MS,
): Promise<void> {
  const remainingMs = minimumMs - (Date.now() - startedAt);
  if (remainingMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
  }
}
