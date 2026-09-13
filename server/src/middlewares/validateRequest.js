import ApiError from "../utils/ApiError.js";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message.replace(/['"]/g, ""),
      }));

      throw new ApiError(400, "Validation failed", errors);
    }

    next();
  };
};

export default validateRequest;
