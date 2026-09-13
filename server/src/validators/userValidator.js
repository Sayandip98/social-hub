import Joi from "joi";

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().max(50).optional().messages({
    "string.max": "Full name cannot exceed 50 characters",
  }),

  bio: Joi.string().max(150).allow("").optional().messages({
    "string.max": "Bio cannot exceed 150 characters",
  }),

  website: Joi.string().uri().allow("").optional().messages({
    "string.uri": "Please enter a valid URL",
  }),

  gender: Joi.string()
    .valid("male", "female", "prefer_not_to_say")
    .optional()
    .messages({
      "any.only": "Gender must be male, female or prefer_not_to_say",
    }),

  isPrivate: Joi.boolean().optional(),
});
