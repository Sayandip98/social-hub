import Joi from "joi";

export const createCommentSchema = Joi.object({
  text: Joi.string().max(1000).required().messages({
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment text is required",
  }),
});

export const replyCommentSchema = Joi.object({
  text: Joi.string().max(1000).required().messages({
    "string.max": "Reply cannot exceed 1000 characters",
    "any.required": "Reply text is required",
  }),
});
