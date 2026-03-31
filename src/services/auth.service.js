import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { generateToken } from "../utils/jwt.js";
import createError from "http-errors";

const register = async ({ name, email, password, role }) => {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createError.Conflict("Email đã được sử dụng");
    }
    // 2. Tìm role theo tên (mặc định "user" nếu không truyền)
    const roleName = role || "user";
    const foundRole = await Role.findOne({ name: roleName });
    if (!foundRole) {
        throw createError.BadRequest(`Role "${roleName}" không tồn tại`);
    }
    // 3. Tạo user (password tự động hash qua pre-save hook)
    const newUser = await User.create({
        name,
        email,
        password,
        role: foundRole._id
    });
    // 4. Trả về user (ẩn password), KHÔNG trả token
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return { user: userResponse };
};

const login = async ({ email, password }) => {
    // 1. Tìm user theo email, populate role để lấy tên role
    const user = await User.findOne({ email }).populate("role", "name");
    if (!user) {
        throw createError.Unauthorized("Email hoặc mật khẩu không đúng");
    }
    // 2. So sánh password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw createError.Unauthorized("Email hoặc mật khẩu không đúng");
    }
    // 3. Kiểm tra tài khoản có active không
    if (!user.isActive) {
        throw createError.Forbidden("Tài khoản đã bị vô hiệu hóa");
    }
    // 4. Tạo JWT token
    const token = generateToken({
        userId: user._id,
        role: user.role.name
    });
    // 5. Chỉ trả token
    return { token };
};

export default { register, login };
