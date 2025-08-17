export const REQUEST_SOURCE = {
  BODY: "body",
  PARAMS: "params",
  QUERY: "query",
} as const;

export type RequestSource =
  (typeof REQUEST_SOURCE)[keyof typeof REQUEST_SOURCE];
