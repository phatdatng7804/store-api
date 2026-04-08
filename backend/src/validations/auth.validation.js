import Joi from "joi";

const registerSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(30),
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().min(6),
})

const loginSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required()
})

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
})

export {registerSchema, loginSchema, refreshTokenSchema}