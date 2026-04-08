import { Router } from "express";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";

const router = Router();

const fmt = (doc) => doc ? JSON.parse(JSON.stringify(doc)) : null;
const fmtAll = (docs) => JSON.parse(JSON.stringify(docs));

// GET /api/reviews/product/:productId  - lấy tất cả review của 1 sản phẩm
router.get("/product/:productId", async (req, res, next) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
            isDeleted: false
        })
            .populate("user", "username fullName avatarUrl")
            .sort({ createdAt: -1 });

        // Tính thống kê rating
        const total = reviews.length;
        const avgRating = total === 0 ? 0 : (reviews.reduce((sum, r) => sum + r.rating, 0) / total);
        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: reviews.filter(r => r.rating === star).length
        }));

        res.json({
            reviews: fmtAll(reviews),
            stats: {
                total,
                avgRating: Math.round(avgRating * 10) / 10,
                distribution
            }
        });
    } catch (e) { next(e); }
});

// POST /api/reviews  - tạo review mới
router.post("/", async (req, res, next) => {
    try {
        const { userId, productId, rating, title, comment } = req.body;

        if (!userId || !productId || !rating) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating phải từ 1 đến 5" });
        }

        // Kiểm tra đã review chưa
        const existing = await Review.findOne({ user: userId, product: productId });
        if (existing) {
            return res.status(409).json({ error: "Bạn đã đánh giá sản phẩm này rồi!" });
        }

        // Kiểm tra đã mua hàng chưa (verified purchase)
        const userOrders = await Order.find({ user: userId, status: { $in: ["PAID", "PENDING"] } });
        let isVerifiedPurchase = false;
        if (userOrders.length > 0) {
            const orderIds = userOrders.map(o => o._id);
            // Check if any order item contains a variant of this product
            const orderItems = await OrderItem.find({ order: { $in: orderIds } })
                .populate({ path: "productVariant", select: "product" });
            isVerifiedPurchase = orderItems.some(
                item => String(item.productVariant?.product) === String(productId)
            );
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            title: title?.trim() || "",
            comment: comment?.trim() || "",
            isVerifiedPurchase
        });

        const populated = await Review.findById(review._id).populate("user", "username fullName avatarUrl");
        res.status(201).json(fmt(populated));
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ error: "Bạn đã đánh giá sản phẩm này rồi!" });
        }
        next(e);
    }
});

// PATCH /api/reviews/:id/helpful  - vote helpful
router.patch("/:id/helpful", async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpfulCount: 1 } },
            { new: true }
        );
        if (!review) return res.status(404).json({ error: "Không tìm thấy review" });
        res.json({ helpfulCount: review.helpfulCount });
    } catch (e) { next(e); }
});

// DELETE /api/reviews/:id  - xoá review (admin hoặc chính user)
router.delete("/:id", async (req, res, next) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Đã xoá đánh giá" });
    } catch (e) { next(e); }
});

export default router;
