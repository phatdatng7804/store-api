import Product from "../models/product.model.js";
import createError from "http-errors";

const getAll = async () => {
    return await Product.find({ isDeleted: false }).populate("category", "name");
};

const getOne = async (id) => {
    const product = await Product.findOne({ _id: id, isDeleted: false }).populate("category", "name");
    if (!product) throw createError(404, "Không tìm thấy product");
    return product;
};

const create = async (data) => {
    const product = new Product(data);
    return await product.save();
};

const update = async (id, data) => {
    const product = await Product.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    if (!product) throw createError(404, "Không tìm thấy hoặc đã bị xóa");
    return product;
};

const softDelete = async (id) => {
    const product = await Product.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!product) throw createError(404, "Không tìm thấy");
    return product;
};

export default { getAll, getOne, create, update, softDelete };
