export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  UNPROCESSABLE_ENTITY: 422,
} as const;

export type HttpStatusValue = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
