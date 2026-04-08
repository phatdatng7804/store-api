import colorService from "../services/color.service.js";

const getAll = async (req, res, next) => {
    try {
        const result = await colorService.getAll();
        res.status(200).json({ message: "Thành công", data: result });
    } catch (error) { next(error); }
};

const getOne = async (req, res, next) => {
    try {
        const result = await colorService.getOne(req.params.id);
        res.status(200).json({ message: "Thành công", data: result });
    } catch (error) { next(error); }
};

const create = async (req, res, next) => {
    try {
        const result = await colorService.create(req.body);
        res.status(201).json({ message: "Tạo thành công", data: result });
    } catch (error) { next(error); }
};

const update = async (req, res, next) => {
    try {
        const result = await colorService.update(req.params.id, req.body);
        res.status(200).json({ message: "Cập nhật thành công", data: result });
    } catch (error) { next(error); }
};

const softDelete = async (req, res, next) => {
    try {
        const result = await colorService.softDelete(req.params.id);
        res.status(200).json({ message: "Xóa mềm thành công", data: result });
    } catch (error) { next(error); }
};

export default { getAll, getOne, create, update, softDelete };
