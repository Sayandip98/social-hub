import Joi from "joi";

export const createPostSchema = Joi.object({
  caption: Joi.string().max(2200).allow("").optional().messages({
    "string.max": "Caption cannot exceed 2200 characters",
  }),

  location: Joi.string().max(100).allow("").optional().messages({
    "string.max": "Location cannot exceed 100 characters",
  }),

  tags: Joi.array().items(Joi.string()).max(10).optional().messages({
    "array.max": "Cannot tag more than 10 users",
  }),

  hashtags: Joi.array().items(Joi.string()).max(30).optional().messages({
    "array.max": "Cannot use more than 30 hashtags",
  }),
});

export const updatePostSchema = Joi.object({
  caption: Joi.string().max(2200).allow("").optional(),

  location: Joi.string().max(100).allow("").optional(),
});
