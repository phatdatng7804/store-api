const errorHandler = (err, req, res, next) => {
    // Log lỗi ra terminal để debug
    console.error("❌ Error:", err);

    // Mongoose validation error
    if (err.name === "ValidationError" && err.errors) {
        const details = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            details
        });
    }

    // Mongoose duplicate key (email trùng, v.v.)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            message: `${field} đã tồn tại`
        });
    }

    // http-errors (createError)
    const status = err.status || 500;
    const message = err.message || "Lỗi server";

    res.status(status).json({ message });
};

export default errorHandler;
