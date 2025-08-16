export interface ErrorDetail<T = unknown> {
  message: string;
  code?: string | number;
  details?: T;
  type?: string;
}

export class ApiErrorResponse<T = unknown> {
  success = false;
  error: ErrorDetail<T>;

  constructor({
    message,
    code,
    details,
    type,
  }: {
    message: string;
    code?: string | number;
    details?: T;
    type?: string;
  }) {
    this.error = { message, code, details, type };
  }
}
