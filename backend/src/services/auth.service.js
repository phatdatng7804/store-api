import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import createError from "http-errors";

const register = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createError.Conflict("Email đã được sử dụng");
    }
    const roleName = role || "user";
    const foundRole = await Role.findOne({ name: roleName });
    if (!foundRole) {
        throw createError.BadRequest(`Role "${roleName}" không tồn tại`);
    }
    const newUser = await User.create({
        name,
        email,
        password,
        role: foundRole._id
    });
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return { user: userResponse };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).populate("role", "name");
    if (!user) {
        throw createError.Unauthorized("Email hoặc mật khẩu không đúng");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw createError.Unauthorized("Email hoặc mật khẩu không đúng");
    }
    if (!user.isActive) {
        throw createError.Forbidden("Tài khoản đã bị vô hiệu hóa");
    }
    
    // Tạo access token và refresh token
    const accessToken = generateAccessToken({
        userId: user._id,
        role: user.role.name
    });
    
    const refreshToken = generateRefreshToken({
        userId: user._id,
        role: user.role.name
    });

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
};

const refreshTokenService = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw createError.BadRequest("Refresh token là bắt buộc");
    }

    try {
        // Kiểm tra tính hợp lệ của token
        const decoded = verifyRefreshToken(refreshToken);

        // Tìm user với refresh token
        const user = await User.findOne({ _id: decoded.userId, refreshToken }).populate("role", "name");

        if (!user) {
            throw createError.Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // Tạo tokens mới
        const newAccessToken = generateAccessToken({
            userId: user._id,
            role: user.role.name
        });

        const newRefreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role.name
        });

        // Cập nhật refresh token trong DB
        user.refreshToken = newRefreshToken;
        await user.save();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw createError.Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
    }
};

const logout = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError.NotFound("User không tồn tại");
    }

    // Xóa refresh token
    user.refreshToken = null;
    await user.save();

    return { message: "Đăng xuất thành công" };
};

export default { register, login, refreshTokenService, logout };
