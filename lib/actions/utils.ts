import type {
  ActionError,
  ActionResult,
} from "@/lib/types/action-result";

/**
 * Creates a successful action result.
 */
export function actionSuccess<T>(
  data: T,
  message?: string
): ActionResult<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Creates a failed action result.
 */
export function actionFailure(
  message: string,
  errors?: Record<string, string[] | undefined>
): ActionError {
  return {
    success: false,
    message,
    errors,
  };
}

/**
 * Converts unknown exceptions into ActionError.
 */
export function actionError(
  error: unknown,
  fallbackMessage: string
): ActionError {
  return actionFailure(
    error instanceof Error
      ? error.message
      : fallbackMessage
  );
}

/**
 * Executes a server action safely.
 */
export async function executeAction<T>(
  operation: () => Promise<T>,
  fallbackMessage: string
): Promise<ActionResult<T>> {
  try {
    const data = await operation();

    return actionSuccess(data);
  } catch (error) {
    return actionError(
      error,
      fallbackMessage
    );
  }
}