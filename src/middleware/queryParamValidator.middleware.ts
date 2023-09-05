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

      if (errorResponse.httpCode) {
        res.status(errorResponse.httpCode);
        delete errorResponse.httpCode;
      }

      res.json(errorResponse);

      return;
    }

    next();
  };
};

const generateErrorResponse = (invalidParamNames: string[]): ErrorResponse => {
  const errors: string[] = [];

  for (const paramName of invalidParamNames) {
    errors.push(`Parameter '${paramName}' is required`);
  }

  return {
    httpCode: 400,
    errors,
  };
};

export default validateQueryParams;
