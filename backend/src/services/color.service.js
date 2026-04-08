import Color from "../models/color.model.js";
import createError from "http-errors";

const getAll = async () => {
    return await Color.find({ isDeleted: false });
};

const getOne = async (id) => {
    const color = await Color.findOne({ _id: id, isDeleted: false });
    if (!color) throw createError(404, "Không tìm thấy color");
    return color;
};

const create = async (data) => {
    const color = new Color(data);
    return await color.save();
};

const update = async (id, data) => {
    const color = await Color.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    if (!color) throw createError(404, "Không tìm thấy hoặc đã bị xóa");
    return color;
};

const softDelete = async (id) => {
    const color = await Color.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!color) throw createError(404, "Không tìm thấy");
    return color;
};

export default { getAll, getOne, create, update, softDelete };
