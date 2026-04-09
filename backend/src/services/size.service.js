import Size from "../models/size.model.js";
import createError from "http-errors";

const getAll = async () => {
    return await Size.find({ isDeleted: false });
};

const getOne = async (id) => {
    const size = await Size.findOne({ _id: id, isDeleted: false });
    if (!size) throw createError(404, "Không tìm thấy size");
    return size;
};

const create = async (data) => {
    const size = new Size(data);
    return await size.save();
};

const update = async (id, data) => {
    const size = await Size.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    if (!size) throw createError(404, "Không tìm thấy hoặc đã bị xóa");
    return size;
};

const softDelete = async (id) => {
    const size = await Size.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!size) throw createError(404, "Không tìm thấy");
    return size;
};

export default { getAll, getOne, create, update, softDelete };
