/**
 * Throws a normalized database error.
 */
export function throwDatabaseError(
  error: { message: string } | null,
  operation: string
): void {
  if (!error) {
    return;
  }

  throw new Error(
    `Database error while ${operation}: ${error.message}`
  );
}

/**
 * Ensures a queried resource exists.
 */
export function ensureFound<T>(
  data: T | null,
  resource: string
): T {
  if (!data) {
    throw new Error(`${resource} not found.`);
  }

  return data;
}