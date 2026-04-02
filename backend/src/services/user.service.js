import User from "../models/user.model.js";
import UserAddress from "../models/userAddress.model.js";
import createError from "http-errors";

const updateProfile = async (userId, data) => {
    const allowedFields = ["name", "gender", "phone"];
    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        throw createError.NotFound("Không tìm thấy user");
    }

    return updatedUser;
};
const createAddress = async (userId, data) => {
    // Nếu đặt isDefault = true → bỏ default cũ
    if (data.isDefault) {
        await UserAddress.updateMany(
            { user: userId, isDefault: true },
            { isDefault: false }
        );
    }

    const address = await UserAddress.create({
        ...data,
        user: userId
    });

    return address;
};

const getAddresses = async (userId) => {
    return UserAddress.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

const updateAddress = async (userId, addressId, data) => {
    // Tìm address và kiểm tra quyền sở hữu
    const address = await UserAddress.findById(addressId);
    if (!address) {
        throw createError.NotFound("Không tìm thấy địa chỉ");
    }
    if (address.user.toString() !== userId) {
        throw createError.Forbidden("Bạn không có quyền sửa địa chỉ này");
    }

    // Nếu đặt isDefault = true → bỏ default cũ
    if (data.isDefault) {
        await UserAddress.updateMany(
            { user: userId, isDefault: true, _id: { $ne: addressId } },
            { isDefault: false }
        );
    }

    const updated = await UserAddress.findByIdAndUpdate(
        addressId,
        data,
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteAddress = async (userId, addressId) => {
    const address = await UserAddress.findById(addressId);
    if (!address) {
        throw createError.NotFound("Không tìm thấy địa chỉ");
    }
    if (address.user.toString() !== userId) {
        throw createError.Forbidden("Bạn không có quyền xóa địa chỉ này");
    }

    await UserAddress.findByIdAndDelete(addressId);
    return { message: "Xóa địa chỉ thành công" };
};

export default { updateProfile, createAddress, getAddresses, updateAddress, deleteAddress };
