import Joi from "joi";

export const createStorySchema = Joi.object({
  text: Joi.string().max(200).allow("").optional().messages({
    "string.max": "Story text cannot exceed 200 characters",
  }),
});
