import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import createError from "http-errors";

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

const register = async ({ username, email, password, fullName, phone }) => {
    if (!username) throw createError.BadRequest("Tên đăng nhập không được để trống");
    if (!email) throw createError.BadRequest("Email không được để trống");
    if (!password) throw createError.BadRequest("Mật khẩu không được để trống");

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) throw createError.Conflict("Tên đăng nhập đã tồn tại");

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) throw createError.Conflict("Email đã được sử dụng");

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
    if (!username || !password) throw createError.BadRequest("Vui lòng nhập tên đăng nhập và mật khẩu");

    const user = await User.findOne({ username: username.toLowerCase() }).populate("role");
    if (!user) throw createError.Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError.Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng");

    if (!user.isActive) throw createError.Forbidden("Tài khoản đã bị vô hiệu hóa");

    return { user: formatUser(user), message: "Đăng nhập thành công" };
};

export default { register, login, formatUser };
