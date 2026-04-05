import userService from "../services/user.service.js";

const updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.user.userId, req.body);
        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

const createAddress = async (req, res, next) => {
    try {
        const address = await userService.createAddress(req.user.userId, req.body);
        res.status(201).json({
            message: "Tạo địa chỉ thành công",
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const getAddresses = async (req, res, next) => {
    try {
        const addresses = await userService.getAddresses(req.user.userId);
        res.status(200).json({
            message: "Lấy danh sách địa chỉ thành công",
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const address = await userService.updateAddress(req.user.userId, req.params.id, req.body);
        res.status(200).json({
            message: "Cập nhật địa chỉ thành công",
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const result = await userService.deleteAddress(req.user.userId, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export default { updateProfile, createAddress, getAddresses, updateAddress, deleteAddress };
