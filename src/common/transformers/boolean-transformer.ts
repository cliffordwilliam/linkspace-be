import { Transform, TransformFnParams } from "class-transformer";

export function ToBoolean() {
  return Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null) return undefined;
    if (value === "true") return true;
    if (value === "false") return false;
    return Boolean(value);
  });
}
