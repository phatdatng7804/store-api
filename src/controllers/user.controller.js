import userService from "../services/user.service.js";

const updateProfile = async (req, res, next) => {
    try {
        // req.user.userId từ JWT token (auth middleware đã decode)
        const updatedUser = await userService.updateProfile(req.user.userId, req.body);
        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

export default { updateProfile };
