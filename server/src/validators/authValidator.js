import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase()
    .required()
    .messages({
      "string.alphanum": "Username can only contain letters and numbers",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(100).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  fullName: Joi.string().max(50).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().lowercase().optional(),

  username: Joi.string().lowercase().optional(),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
})
  .or("email", "username")
  .messages({
    "object.missing": "Please provide either email or username",
  });

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),

  newPassword: Joi.string().min(6).max(100).required().messages({
    "string.min": "New password must be at least 6 characters",
    "any.required": "New password is required",
  }),
});
