import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../model/response.models";

const validateQueryParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidParamNames = [];

    for (const paramName of paramNames) {
      const paramValue = req.query[paramName];

      if (!paramValue) {
        invalidParamNames.push(paramName);
      }
    }

    if (invalidParamNames.length > 0) {
      const errorResponse: ErrorResponse =
        generateErrorResponse(invalidParamNames);
      res.status(errorResponse.errorCode).send(errorResponse);
      return;
    }

    next();
  };
};

const generateErrorResponse = (invalidParamNames: string[]): ErrorResponse => {
  const errors: string[] = [];

  for (const paramName of invalidParamNames) {
    errors.push(`Param '${paramName}' is required`);
  }

  return {
    errorCode: 400,
    errors,
  };
};

export default validateQueryParams;
