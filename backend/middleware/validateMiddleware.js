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
        .min(6)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters long.",
        }),
    collegeId: Joi.string().when('customCollegeName', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required()
    }),
    customCollegeName: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().allow(""),
    officialId: Joi.string().required().messages({
        "any.required": "Official University ID is required for verification."
    }),
    academicClass: Joi.string().allow(""),
    section: Joi.string().allow(""),
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

export const createEventSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().valid("sports", "hackathon", "cultural", "workshop", "seminar", "technical", "other").required(),
    location: Joi.string().required(),
    audience: Joi.string().valid("my_college", "all_colleges").default("all_colleges"),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    maxParticipants: Joi.number().min(1).allow(null),
    registrationDeadline: Joi.date().less(Joi.ref('startDate')).allow(null),
    requirements: Joi.array().items(Joi.string()),
    dosAndDonts: Joi.array().items(Joi.string()),
    participationRequirements: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        fieldType: Joi.string().valid("text", "file", "number", "email").default("text"),
        isRequired: Joi.boolean().default(true),
    })),
    imageUrl: Joi.string().allow(""),
    bannerImage: Joi.string().allow(""),
    customCategory: Joi.string().trim().allow(""),
    isTeamEvent: Joi.boolean().default(false),
    minTeamSize: Joi.number().integer().min(1),
    maxTeamSize: Joi.number().integer().min(1),
    participationMode: Joi.string().valid("solo", "duo", "trio", "quad").default("solo"),
    college: Joi.string().optional(),
});

export const updateEventSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    category: Joi.string().valid("sports", "hackathon", "cultural", "workshop", "seminar", "technical", "other"),
    location: Joi.string(),
    audience: Joi.string().valid("my_college", "all_colleges"),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    maxParticipants: Joi.number().min(1).allow(null),
    registrationDeadline: Joi.date().allow(null),
    requirements: Joi.array().items(Joi.string()),
    dosAndDonts: Joi.array().items(Joi.string()),
    participationRequirements: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        fieldType: Joi.string().valid("text", "file", "number", "email"),
        isRequired: Joi.boolean(),
    })),
    imageUrl: Joi.string().allow(""),
    bannerImage: Joi.string().allow(""),
    customCategory: Joi.string().trim().allow(""),
    isTeamEvent: Joi.boolean(),
    minTeamSize: Joi.number().integer().min(1),
    maxTeamSize: Joi.number().integer().min(1),
    participationMode: Joi.string().valid("solo", "duo", "trio", "quad"),
});

export default validateRequest;
