import { ValidationError } from "class-validator";
import {
  RequestSource,
  REQUEST_SOURCE,
} from "@/common/constants/request-source";

export class DTOValidationException extends Error {
  public code = "VALIDATION_ERROR";
  constructor(
    public errors: ValidationError[],
    public source: RequestSource = REQUEST_SOURCE.BODY,
  ) {
    super("Request validation error");
    this.name = "DTOValidationException";
  }
}
