import Joi from "joi";

const registerSchema = Joi.object({
    username: Joi.string().required().trim().min(3).max(30),
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().min(6),
    fullName: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional()
})

const loginSchema = Joi.object({
    username: Joi.string().required().trim(),
    password: Joi.string().required()
})

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
})

export {registerSchema, loginSchema, refreshTokenSchema}