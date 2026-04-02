import Joi from "joi";

const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(30),
    gender: Joi.number().valid(0, 1, 2),
    phone: Joi.string().trim().pattern(/^[0-9]{9,11}$/).messages({
        "string.pattern.base": "Số điện thoại phải từ 9-11 chữ số"
    })
}).min(1).messages({
    "object.min": "Cần ít nhất 1 trường để cập nhật"
});

const createAddressSchema = Joi.object({
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    district: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    isDefault: Joi.boolean()
});

const updateAddressSchema = Joi.object({
    street: Joi.string().trim(),
    city: Joi.string().trim(),
    district: Joi.string().trim(),
    country: Joi.string().trim(),
    isDefault: Joi.boolean()
}).min(1).messages({
    "object.min": "Cần ít nhất 1 trường để cập nhật"
});

export { updateProfileSchema, createAddressSchema, updateAddressSchema };

