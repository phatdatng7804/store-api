import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { generateToken } from "../utils/jwt.js";
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
    const token = generateToken({
        userId: user._id,
        role: user.role.name
    });
    return { token };
};

export default { register, login };
