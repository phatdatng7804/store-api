import authService from "../services/auth.service.js";

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            message: "Đăng ký thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            message: "Đăng nhập thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default { register, login };
