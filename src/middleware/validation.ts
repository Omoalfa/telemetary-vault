import { Request, Response, NextFunction, RequestHandler } from "express";
import { checkSchema, validationResult, Schema } from "express-validator";

const validate = (schema: Schema): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
  await Promise.all(checkSchema(schema).map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.status(400).json({ errors: errors.array() });
};

export const signupValidation = validate({
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Invalid email address",
    },
    notEmpty: {
      errorMessage: "Email is required",
    },
    trim: true,
  },
  name: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Name must be a string",
    },
    trim: true,
    isLength: {
      options: { min: 2 },
      errorMessage: "Name must be at least 2 characters long",
    },
  },
});

export const ingestValidation = validate({
  source: {
    in: ["body"],
    isString: {
      errorMessage: "Source must be a string",
    },
    notEmpty: {
      errorMessage: "Source is required",
    },
    trim: true,
  },
  payload: {
    in: ["body"],
    exists: {
      errorMessage: "Payload is required",
    },
    isObject: {
      errorMessage: "Payload must be a JSON object",
    },
  },
});

export const queryValidation = validate({
  page: {
    in: ["query"],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: "Page must be an integer greater than 0",
    },
    toInt: true,
  },
  limit: {
    in: ["query"],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: "Limit must be an integer between 1 and 100",
    },
    toInt: true,
  },
  source: {
    in: ["query"],
    optional: true,
    isString: true,
    trim: true,
  },
  start: {
    in: ["query"],
    optional: true,
    isISO8601: {
      errorMessage: "Start timestamp must be a valid ISO 8601 date",
    },
    toDate: true,
  },
  end: {
    in: ["query"],
    optional: true,
    isISO8601: {
      errorMessage: "End timestamp must be a valid ISO 8601 date",
    },
    toDate: true,
  },
});
