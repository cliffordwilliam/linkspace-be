export interface ApiResponse<TData, TMeta = Record<string, unknown>> {
  success: boolean;
  data: TData;
  meta?: TMeta;
}
