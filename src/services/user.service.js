import User from "../models/user.model.js";
import createError from "http-errors";

const updateProfile = async (userId, data) => {
    // Chỉ cho phép update các field này
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

export default { updateProfile };
