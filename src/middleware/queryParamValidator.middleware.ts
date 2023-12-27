import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../model/response.models";

const validateQueryParamsAndReturnErrorResponseIfError = (
  paramNames: string[]
) => {
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

      if (errorResponse.status_code) {
        res.status(errorResponse.status_code);
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
    errors.push(`Param '${paramName}' is required`);
  }

  return {
    status_code: 400,
    message: "Missing required params",
    errors,
  };
};

export default validateQueryParamsAndReturnErrorResponseIfError;
