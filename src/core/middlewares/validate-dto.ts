import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import {
  RequestSource,
  REQUEST_SOURCE,
} from "@/common/constants/request-source";
import { DTOValidationException } from "@/api/errors/dto-validation-exception";
import { BaseDTO } from "@/common/dto/base-dto";

export interface ValidatedRequestQuery<T> {
  validatedQuery: T;
}

export const validateDTO = <T extends BaseDTO>(
  DTOClass: ClassConstructor<T>,
  source: RequestSource = REQUEST_SOURCE.BODY,
): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const dtoInstance = plainToInstance(DTOClass, req[source]);
      await validateOrReject(dtoInstance);
      if (source === REQUEST_SOURCE.QUERY) {
        (req as unknown as ValidatedRequestQuery<T>).validatedQuery =
          dtoInstance;
      } else {
        req[source] = dtoInstance;
      }
      next();
    } catch (errors) {
      next(new DTOValidationException(errors as ValidationError[], source));
    }
  };
};
