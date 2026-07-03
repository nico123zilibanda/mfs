export type ActionSuccess<T = undefined> = {
  success: true;
  data: T;
  message?: string;
};

export type ActionError = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export type ActionResult<T = undefined> =
  | ActionSuccess<T>
  | ActionError;