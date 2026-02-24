import Joi from "joi";
import AppError from "../utils/appError.js";

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message.replace(/"/g, ""))
                .join(", ");
            return next(new AppError(errorMessage, 400));
        }

        next();
    };
};

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
            "string.min": "Password must be at least 8 characters long.",
        }),
    collegeId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().allow(""),
    role: Joi.string().valid("student", "college_admin").default("student"),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const requestResetSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
        }),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
        }),
});

export default validateRequest;
