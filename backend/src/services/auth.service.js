import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import createError from "http-errors";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

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

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateUniqueUsername = async (base) => {
    let normalized = base.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized) normalized = "user";
    let username = normalized;
    let suffix = 1;
    while (await User.findOne({ username })) {
        username = `${normalized}${suffix}`;
        suffix += 1;
    }
    return username;
};

const verifyGoogleIdToken = async (idToken) => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};

const googleLogin = async ({ idToken }) => {
    if (!idToken) throw createError.BadRequest("Google ID token không được để trống");
    const payload = await verifyGoogleIdToken(idToken);
    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const fullName = payload?.name || "";
    const avatarUrl = payload?.picture || "";

    if (!email || !emailVerified) {
        throw createError.Unauthorized("Email Google chưa được xác thực");
    }

    let user = await User.findOne({ email: email.toLowerCase() }).populate("role");
    if (!user) {
        const usernameBase = (email.split("@")[0] || "googleuser");
        const username = await generateUniqueUsername(usernameBase);

        let userRole = await Role.findOne({ code: "USER" });
        if (!userRole) {
            userRole = await Role.create({ code: "USER", name: "User" });
        }

        const password = crypto.randomBytes(16).toString("hex");
        const newUser = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            fullName,
            avatarUrl,
            role: userRole._id
        });
        user = await User.findById(newUser._id).populate("role");
    }

    if (!user.isActive) {
        throw createError.Forbidden("Tài khoản đã bị vô hiệu hóa");
    }
    if (user.isDeleted) {
        throw createError.Forbidden("Tài khoản đã bị xóa");
    }

    const accessToken = generateAccessToken({
        userId: user._id,
        role: user.role ? user.role.code : "USER"
    });
    const refreshToken = generateRefreshToken({
        userId: user._id,
        role: user.role ? user.role.code : "USER"
    });

    user.refreshToken = refreshToken;
    await user.save();

    return { user: formatUser(user), accessToken, refreshToken, message: "Đăng nhập bằng Google thành công" };
};

const register = async ({ username, email, password, fullName, phone }) => {
    if (!username) throw createError(400, "Tên đăng nhập không được để trống");
    if (!email) throw createError(400, "Email không được để trống");
    if (!password) throw createError(400, "Mật khẩu không được để trống");

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) throw createError(409, "Tên đăng nhập đã tồn tại");

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) throw createError(409, "Email đã được sử dụng");

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

const login = async ({ username, email, password }) => {
    if (!password) throw createError.BadRequest("Vui lòng nhập mật khẩu");
    if (!username && !email) throw createError.BadRequest("Vui lòng nhập tên đăng nhập hoặc email");

    const query = username ? { username: username.toLowerCase() } : { email: email.toLowerCase() };
    const user = await User.findOne(query).populate("role");

    if (!user) {
        throw createError.Unauthorized("Thông tin đăng nhập không đúng");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw createError.Unauthorized("Thông tin đăng nhập không đúng");
    }
    if (!user.isActive) {
        throw createError.Forbidden("Tài khoản đã bị vô hiệu hóa");
    }
    if (user.isDeleted) {
        throw createError.Forbidden("Tài khoản đã bị xóa");
    }

    const accessToken = generateAccessToken({
        userId: user._id,
        role: user.role ? user.role.code : "USER"
    });
    const refreshToken = generateRefreshToken({
        userId: user._id,
        role: user.role ? user.role.code : "USER"
    });

    user.refreshToken = refreshToken;
    await user.save();

    return { user: formatUser(user), accessToken, refreshToken, message: "Đăng nhập thành công" };
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
            role: user.role ? user.role.code : "USER"
        });

        const newRefreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role ? user.role.code : "USER"
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

export default { register, login, refreshTokenService, logout, formatUser, googleLogin };
