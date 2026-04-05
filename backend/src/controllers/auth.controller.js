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

const refreshToken = async (req, res, next) => {
    try {
        const result = await authService.refreshTokenService(req.body);
        res.status(200).json({
            message: "Làm mới token thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // req.user được set từ authMiddleware
        const result = await authService.logout(req.user.userId);
        res.status(200).json({
            message: "Đăng xuất thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default { register, login, refreshToken, logout };
