import Category from "../models/category.model.js";
import createError from "http-errors";

const getAll = async () => {
    return await Category.find({ isDeleted: false });
};

const getOne = async (id) => {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw createError(404, "Không tìm thấy category");
    return category;
};

const create = async (data) => {
    const category = new Category(data);
    return await category.save();
};

const update = async (id, data) => {
    const category = await Category.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    if (!category) throw createError(404, "Không tìm thấy hoặc đã bị xóa");
    return category;
};

const softDelete = async (id) => {
    const category = await Category.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!category) throw createError(404, "Không tìm thấy");
    return category;
};

export default { getAll, getOne, create, update, softDelete };
