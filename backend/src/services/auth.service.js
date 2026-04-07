import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// Helper: format user object cho frontend
const formatUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName || "",
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
    role: user.role ? { code: user.role.code, name: user.role.name } : null
});

const createError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const register = async ({ username, email, password, fullName, phone }) => {
    if (!username) throw createError(400, "Tên đăng nhập không được để trống");
    if (!email) throw createError(400, "Email không được để trống");
    if (!password) throw createError(400, "Mật khẩu không được để trống");

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) throw createError(409, "Tên đăng nhập đã tồn tại");

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) throw createError(409, "Email đã được sử dụng");

    // Find USER role
    let userRole = await Role.findOne({ code: "USER" });
    if (!userRole) {
        userRole = await Role.create({ code: "USER", name: "User" });
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        fullName: fullName || "",
        phone: phone || "",
        role: userRole._id
    });

    const populated = await User.findById(newUser._id).populate("role");
    return { user: formatUser(populated), message: "Đăng ký thành công" };
};

const login = async ({ username, password }) => {
    if (!username || !password) throw createError(400, "Vui lòng nhập tên đăng nhập và mật khẩu");

    const user = await User.findOne({ username: username.toLowerCase() }).populate("role");
    if (!user) throw createError(401, "Tên đăng nhập hoặc mật khẩu không đúng");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError(401, "Tên đăng nhập hoặc mật khẩu không đúng");

    if (!user.isActive) throw createError(403, "Tài khoản đã bị vô hiệu hóa");

    const accessToken = generateAccessToken({
        userId: user._id,
        role: user.role.code
    });

    const refreshToken = generateRefreshToken({
        userId: user._id,
        role: user.role.code
    });

    user.refreshToken = refreshToken;
    await user.save();

    return { 
        user: formatUser(user),
        accessToken,
        refreshToken,
        message: "Đăng nhập thành công"
    };
};

const refreshTokenService = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw createError(400, "Refresh token là bắt buộc");
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findOne({ _id: decoded.userId, refreshToken }).populate("role");

        if (!user) {
            throw createError(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        const newAccessToken = generateAccessToken({
            userId: user._id,
            role: user.role.code
        });

        const newRefreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role.code
        });

        user.refreshToken = newRefreshToken;
        await user.save();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw createError(401, "Refresh token không hợp lệ hoặc đã hết hạn");
    }
};

const logout = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "User không tồn tại");
    }

    user.refreshToken = null;
    await user.save();

    return { message: "Đăng xuất thành công" };
};

export default { register, login, refreshTokenService, logout, formatUser };
