import ProductVariant from "../models/productVariant.model.js";
import createError from "http-errors";

const getAll = async () => {
    return await ProductVariant.find({ isDeleted: false })
        .populate("product", "name")
        .populate("size", "name")
        .populate("color", "name hexcode");
};

const getOne = async (id) => {
    const variant = await ProductVariant.findOne({ _id: id, isDeleted: false })
        .populate("product", "name")
        .populate("size", "name")
        .populate("color", "name hexcode");
    if (!variant) throw createError(404, "Không tìm thấy product variant");
    return variant;
};

const create = async (data) => {
    const variant = new ProductVariant(data);
    return await variant.save();
};

const update = async (id, data) => {
    const variant = await ProductVariant.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    if (!variant) throw createError(404, "Không tìm thấy hoặc đã bị xóa");
    return variant;
};

const softDelete = async (id) => {
    const variant = await ProductVariant.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!variant) throw createError(404, "Không tìm thấy");
    return variant;
};

export default { getAll, getOne, create, update, softDelete };
