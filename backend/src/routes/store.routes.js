import { Router } from "express";
import crypto from "crypto";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Category from "../models/category.model.js";
import Color from "../models/color.model.js";
import Size from "../models/size.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from '../models/orderItem.model.js';
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import Role from "../models/role.model.js";
import Review from "../models/review.model.js";

const router = Router();

// ── Helper: format ID ────────────────────────────────────────────────────────
// Uses JSON serialization to trigger Mongoose's global toJSON transform
// This converts _id → id and removes __v at ALL nesting levels
const fmt = (doc) => {
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
};

const fmtAll = (docs) => JSON.parse(JSON.stringify(docs));

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

// GET /api/products  - public, list all active products
router.get("/products", async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate("category").sort({ createdAt: -1 });
        res.json(fmtAll(products));
    } catch (e) { next(e); }
});

// GET /api/products/:id
router.get("/products/:id", async (req, res, next) => {
    try {
        const p = await Product.findById(req.params.id).populate("category");
        if (!p) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        res.json(fmt(p));
    } catch (e) { next(e); }
});

// ── PRODUCT VARIANTS ─────────────────────────────────────────────────────────

// GET /api/product-variants
router.get("/product-variants", async (req, res, next) => {
    try {
        const variants = await ProductVariant.find()
            .populate({ path: "product", populate: { path: "category" } })
            .populate("color")
            .populate("size")
            .sort({ createdAt: -1 });
        res.json(fmtAll(variants));
    } catch (e) { next(e); }
});

// ── CARTS ────────────────────────────────────────────────────────────────────

// Helper: get or create cart for user
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId });
    return cart;
};

// GET /api/carts/user/:userId/items
router.get("/carts/user/:userId/items", async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.params.userId);
        const items = await CartItem.find({ cart: cart._id })
            .populate({
                path: "productVariant",
                populate: [
                    { path: "product" },
                    { path: "color" },
                    { path: "size" }
                ]
            });

        // Serialize to trigger toJSON transform (converts _id→id everywhere)
        const serialized = JSON.parse(JSON.stringify(items));
        const fmtItems = serialized.map(item => ({
            ...item,
            totalPrice: Number(item.productVariant?.price || 0) * Number(item.quantity || 1)
        }));

        res.json({ cartId: cart._id, items: fmtItems });
    } catch (e) { next(e); }
});

// POST /api/carts/user/:userId/add
router.post("/carts/user/:userId/add", async (req, res, next) => {
    try {
        const { productVariantId, quantity = 1 } = req.body;
        const cart = await getOrCreateCart(req.params.userId);

        // Check if item already in cart
        let item = await CartItem.findOne({ cart: cart._id, productVariant: productVariantId });
        if (item) {
            item.quantity += Number(quantity);
            await item.save();
        } else {
            item = await CartItem.create({
                cart: cart._id,
                productVariant: productVariantId,
                quantity: Number(quantity)
            });
        }
        res.json({ message: "Đã thêm vào giỏ hàng", itemId: item._id });
    } catch (e) { next(e); }
});

// PUT /api/carts/items/:itemId/quantity
router.put("/carts/items/:itemId/quantity", async (req, res, next) => {
    try {
        const { quantity } = req.body;
        if (Number(quantity) <= 0) {
            await CartItem.findByIdAndDelete(req.params.itemId);
            return res.json({ message: "Đã xóa khỏi giỏ hàng" });
        }
        const item = await CartItem.findByIdAndUpdate(req.params.itemId, { quantity: Number(quantity) }, { new: true });
        res.json(fmt(item));
    } catch (e) { next(e); }
});

// DELETE /api/carts/items/:itemId
router.delete("/carts/items/:itemId", async (req, res, next) => {
    try {
        await CartItem.findByIdAndDelete(req.params.itemId);
        res.json({ message: "Đã xóa khỏi giỏ hàng" });
    } catch (e) { next(e); }
});

// DELETE /api/carts/user/:userId/clear
router.delete("/carts/user/:userId/clear", async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.params.userId });
        if (cart) await CartItem.deleteMany({ cart: cart._id });
        res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
    } catch (e) { next(e); }
});

// ── ORDERS ───────────────────────────────────────────────────────────────────

// GET /api/orders/user/:userId
router.get("/orders/user/:userId", async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(fmtAll(orders));
    } catch (e) { next(e); }
});

// GET /api/orders (admin - all orders)
router.get("/orders", async (req, res, next) => {
    try {
        const orders = await Order.find().populate("user", "username fullName email").sort({ createdAt: -1 });
        res.json(fmtAll(orders));
    } catch (e) { next(e); }
});

// POST /api/orders/create
router.post("/orders/create", async (req, res, next) => {
    try {
        const { userId, receiverName, receiverPhone, shippingAddress, note, paymentMethod, couponCode } = req.body;

        // Get cart items
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(400).json({ error: "Không tìm thấy giỏ hàng" });

        const items = await CartItem.find({ cart: cart._id }).populate("productVariant");
        if (!items.length) return res.status(400).json({ error: "Giỏ hàng trống" });

        const totalAmount = items.reduce((sum, i) => sum + Number(i.productVariant?.price || 0) * Number(i.quantity || 1), 0);

        let discountAmount = 0;
        let finalCouponCode = "";
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
            if (coupon) {
                if (coupon.discountType === "PERCENTAGE") {
                    discountAmount = Math.round(totalAmount * coupon.discountValue / 100);
                } else {
                    discountAmount = coupon.discountValue;
                }
                coupon.usedCount += 1;
                await coupon.save();
                finalCouponCode = coupon.code;
            }
        }

        const finalAmount = Math.max(0, totalAmount - discountAmount);

        const order = await Order.create({
            user: userId,
            receiverName, receiverPhone, shippingAddress, note,
            totalAmount, finalAmount, discountAmount,
            couponCode: finalCouponCode,
            paymentMethod: paymentMethod || "COD",
            status: "PENDING"
        });

        // Create order items
        await Promise.all(items.map(item =>
            OrderItem.create({
                order: order._id,
                productVariant: item.productVariant._id,
                quantity: item.quantity,
                price: item.productVariant.price
            })
        ));

        // Clear cart
        await CartItem.deleteMany({ cart: cart._id });

        res.json({ message: "Đặt hàng thành công", orderId: order._id, order: fmt(order) });
    } catch (e) { next(e); }
});

// PATCH /api/orders/:id/cancel
router.patch("/orders/:id/cancel", async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: "CANCELLED" }, { new: true });
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
        res.json(fmt(order));
    } catch (e) { next(e); }
});

// PATCH /api/orders/:id/status (admin)
router.patch("/orders/:id/status", async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(fmt(order));
    } catch (e) { next(e); }
});

// ── COUPONS ──────────────────────────────────────────────────────────────────

// GET /api/coupons
router.get("/coupons", async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(fmtAll(coupons));
    } catch (e) { next(e); }
});

// POST /api/coupons/validate
router.post("/coupons/validate", async (req, res, next) => {
    try {
        const { code, orderTotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
        if (!coupon) return res.json({ error: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });

        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return res.json({ error: "Mã giảm giá đã hết hạn" });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.json({ error: "Mã giảm giá đã hết lượt sử dụng" });
        }
        if (coupon.minOrderValue > 0 && orderTotal < coupon.minOrderValue) {
            return res.json({ error: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này` });
        }

        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.round(orderTotal * coupon.discountValue / 100);
        } else {
            discountAmount = Math.min(coupon.discountValue, orderTotal);
        }

        res.json({
            code: coupon.code,
            discountAmount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            message: `Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`
        });
    } catch (e) { next(e); }
});

// POST /api/coupons
router.post("/coupons", async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(fmt(coupon));
    } catch (e) { next(e); }
});

// PUT /api/coupons/:id
router.put("/coupons/:id", async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ error: "Không tìm thấy coupon" });
        res.json(fmt(coupon));
    } catch (e) { next(e); }
});

// DELETE /api/coupons/:id
router.delete("/coupons/:id", async (req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa coupon" });
    } catch (e) { next(e); }
});

// ── MOMO (Real API Integration) ───────────────────────────────────────────────

// Helper: Generate MoMo signature
const generateMoMoSignature = (data, secretKey) => {
    const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
};

// POST /api/momo/create-payment - Call real MoMo API
router.post("/momo/create-payment", async (req, res, next) => {
    try {
        const { userId, receiverName, receiverPhone, shippingAddress, note, couponCode } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(400).json({ error: "Không tìm thấy giỏ hàng" });

        const items = await CartItem.find({ cart: cart._id }).populate("productVariant");
        if (!items.length) return res.status(400).json({ error: "Giỏ hàng trống" });

        const totalAmount = items.reduce((sum, i) => sum + Number(i.productVariant?.price || 0) * Number(i.quantity || 1), 0);

        let discountAmount = 0;
        let finalCouponCode = "";
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
            if (coupon) {
                if (coupon.discountType === "PERCENTAGE") {
                    discountAmount = Math.round(totalAmount * coupon.discountValue / 100);
                } else {
                    discountAmount = coupon.discountValue;
                }
                finalCouponCode = coupon.code;
            }
        }

        const finalAmount = Math.max(0, totalAmount - discountAmount);

        // Create order in PENDING state
        const order = await Order.create({
            user: userId,
            receiverName, receiverPhone, shippingAddress, note,
            totalAmount, finalAmount, discountAmount,
            couponCode: finalCouponCode,
            paymentMethod: "MOMO",
            status: "PENDING",
            momoOrderId: `MOMO_${Date.now()}`,
            statusHistory: [{
                status: "PENDING",
                changedAt: new Date(),
                note: "Đơn hàng được tạo"
            }]
        });

        await Promise.all(items.map(item =>
            OrderItem.create({
                order: order._id,
                productVariant: item.productVariant._id,
                quantity: item.quantity,
                price: item.productVariant.price
            })
        ));

        // Call Real MoMo API
        const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
        const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
        const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://127.0.0.1:5173/payment-result";
        const ipnUrl = process.env.MOMO_IPN_URL || "http://127.0.0.1:3000/api/momo/ipn";

        const requestId = `${order._id}_${Date.now()}`;
        const orderId = order.momoOrderId;
        const amount = String(Math.round(finalAmount));
        const orderInfo = `Thanh toán đơn hàng ${orderId}`;
        const requestType = "captureWallet";
        const extraData = Buffer.from(JSON.stringify({ orderId: order._id })).toString('base64');

        const signatureData = {
            accessKey,
            amount,
            extraData,
            ipnUrl,
            orderId,
            orderInfo,
            partnerCode,
            redirectUrl,
            requestId,
            requestType
        };

        const signature = generateMoMoSignature(signatureData, secretKey);

        // Call MoMo test API
        const momoUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
        const payload = {
            partnerCode,
            partnerName: "Store API",
            partnerUserID: String(userId),
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            requestType,
            signature,
            extraData,
            lang: "vi"
        };

        const momoResponse = await fetch(momoUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const momoData = await momoResponse.json();

        if (momoData.resultCode === 0 && momoData.payUrl) {
            // Save momo requestId for later verification
            order.momoOrderId = orderId;
            await order.save();

            res.json({
                orderId: order._id,
                momoOrderId: orderId,
                payUrl: momoData.payUrl,
                message: "Tạo thanh toán MoMo thành công"
            });
        } else {
            order.status = "FAILED";
            order.statusHistory.push({
                status: "FAILED",
                changedAt: new Date(),
                note: `MoMo error: ${momoData.message}`
            });
            await order.save();

            res.status(400).json({
                error: momoData.message || "Không thể tạo thanh toán MoMo",
                resultCode: momoData.resultCode
            });
        }
    } catch (e) { next(e); }
});

// POST /api/momo/ipn - IPN webhook from MoMo
router.post("/momo/ipn", async (req, res, next) => {
    try {
        const { orderId, resultCode, transId, extraData } = req.body;

        // Find order by momoOrderId
        const order = await Order.findOne({ momoOrderId: orderId });
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        if (order.status === "PAID" || order.status === "FAILED") {
            return res.json({ message: "Đơn hàng đã được xử lý", status: order.status, resultCode: 0 });
        }

        if (resultCode === "0" || resultCode === 0) {
            // Payment success
            order.status = "PAID";
            order.momoTransId = transId || "";
            order.statusHistory.push({
                status: "PAID",
                changedAt: new Date(),
                note: `Thanh toán thành công - MoMo TransID: ${transId}`
            });
            await order.save();

            // Clear cart
            const cart = await Cart.findOne({ user: order.user });
            if (cart) await CartItem.deleteMany({ cart: cart._id });

            // Update coupon usedCount
            if (order.couponCode) {
                await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
            }

            res.json({
                dbOrderId: order._id,
                resultCode: 0,
                transId: order.momoTransId,
                message: "Thanh toán thành công",
                status: "PAID"
            });
        } else {
            order.status = "FAILED";
            order.statusHistory.push({
                status: "FAILED",
                changedAt: new Date(),
                note: `Thanh toán thất bại - Code: ${resultCode}`
            });
            await order.save();
            res.json({
                dbOrderId: order._id,
                resultCode: Number(resultCode),
                transId,
                message: "Thanh toán thất bại",
                status: "FAILED"
            });
        }
    } catch (e) { next(e); }
});

// GET /api/momo/result - Redirect after MoMo payment
router.get("/momo/result", async (req, res, next) => {
    try {
        const { orderId, resultCode, transId } = req.query;

        // Find order by momoOrderId
        const order = await Order.findOne({ momoOrderId: orderId });
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        if (order.status === "PAID" || order.status === "FAILED") {
            return res.json({
                dbOrderId: order._id,
                resultCode: 0,
                transId: order.momoTransId,
                message: "Thanh toán đã được ghi nhận trước đó",
                status: order.status
            });
        }

        if (resultCode === "0" || resultCode === 0) {
            // Payment success
            order.status = "PAID";
            order.momoTransId = transId || "";
            order.statusHistory.push({
                status: "PAID",
                changedAt: new Date(),
                note: `Thanh toán thành công - MoMo TransID: ${transId}`
            });
            await order.save();

            // Clear cart
            const cart = await Cart.findOne({ user: order.user });
            if (cart) await CartItem.deleteMany({ cart: cart._id });

            // Update coupon usedCount
            if (order.couponCode) {
                await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
            }

            res.json({
                dbOrderId: order._id,
                resultCode: 0,
                transId: order.momoTransId,
                message: "Thanh toán thành công",
                status: "PAID"
            });
        } else {
            order.status = "FAILED";
            order.statusHistory.push({
                status: "FAILED",
                changedAt: new Date(),
                note: `Thanh toán thất bại - Code: ${resultCode}`
            });
            await order.save();
            res.json({
                dbOrderId: order._id,
                resultCode: Number(resultCode),
                transId,
                message: "Thanh toán thất bại",
                status: "FAILED"
            });
        }
    } catch (e) { next(e); }
});

// ── REVIEWS ──────────────────────────────────────────────────────────────────

// POST /api/reviews - Submit a review
router.post("/reviews", async (req, res, next) => {
    try {
        const { userId, productId, rating, comment } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating phải từ 1 đến 5" });
        }

        // Check if user has purchased this product
        const orders = await Order.find({ user: userId, status: "PAID" });
        const orderIds = orders.map(o => o._id);

        const hasPurchased = await OrderItem.findOne({
            order: { $in: orderIds },
            productVariant: { $in: await ProductVariant.find({ product: productId }).distinct('_id') }
        });

        if (!hasPurchased) {
            return res.status(403).json({ error: "Bạn phải mua sản phẩm này để đánh giá" });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ error: "Bạn đã đánh giá sản phẩm này rồi" });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment: comment || ""
        });

        const populated = await Review.findById(review._id).populate("user", "fullName avatarUrl").populate("product", "name");
        res.status(201).json(fmt(populated));
    } catch (e) { next(e); }
});

// GET /api/reviews/product/:productId - Get reviews for a product
router.get("/reviews/product/:productId", async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("user", "fullName avatarUrl")
            .sort({ createdAt: -1 });

        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({
            reviews: fmtAll(reviews),
            averageRating: avgRating,
            totalReviews: reviews.length
        });
    } catch (e) { next(e); }
});

// GET /api/reviews - All reviews (admin)
router.get("/reviews", async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate("user", "fullName avatarUrl email username")
            .populate({
                path: "product",
                select: "name category",
                populate: { path: "category", select: "name" }
            })
            .sort({ createdAt: -1 });
        res.json(fmtAll(reviews));
    } catch (e) { next(e); }
});

// DELETE /api/reviews/:id - Delete a review (admin)
router.delete("/reviews/:id", async (req, res, next) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa đánh giá" });
    } catch (e) { next(e); }
});

// ── ORDER TRACKING ───────────────────────────────────────────────────────────

// GET /api/orders/:id/track - Get order tracking timeline
router.get("/orders/:id/track", async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "fullName email phone")
            .populate({
                path: "user",
                select: "fullName email phone"
            });

        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        const timeline = [
            {
                step: 1,
                label: "Đặt hàng",
                timestamp: order.createdAt,
                completed: !!order.createdAt
            },
            {
                step: 2,
                label: "Xác nhận",
                timestamp: order.statusHistory.find(h => h.status === "CONFIRMED")?.changedAt || null,
                completed: ["CONFIRMED", "PAID", "SHIPPING", "DELIVERED"].includes(order.status)
            },
            {
                step: 3,
                label: "Thanh toán",
                timestamp: order.statusHistory.find(h => h.status === "PAID")?.changedAt || null,
                completed: ["PAID", "SHIPPING", "DELIVERED"].includes(order.status)
            },
            {
                step: 4,
                label: "Đang giao",
                timestamp: order.statusHistory.find(h => h.status === "SHIPPING")?.changedAt || null,
                completed: ["SHIPPING", "DELIVERED"].includes(order.status)
            },
            {
                step: 5,
                label: "Hoàn thành",
                timestamp: order.statusHistory.find(h => h.status === "DELIVERED")?.changedAt || null,
                completed: order.status === "DELIVERED"
            }
        ];

        const items = await OrderItem.find({ order: order._id })
            .populate({
                path: "productVariant",
                populate: [
                    { path: "product" },
                    { path: "color" },
                    { path: "size" }
                ]
            });

        res.json({
            orderId: order._id,
            momoOrderId: order.momoOrderId,
            status: order.status,
            totalAmount: order.totalAmount,
            finalAmount: order.finalAmount,
            discountAmount: order.discountAmount,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            expectedDeliveryDate: order.expectedDeliveryDate,
            timeline,
            statusHistory: order.statusHistory,
            items: fmtAll(items),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        });
    } catch (e) { next(e); }
});

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

// GET /api/admin/revenue-stats - Revenue analytics
router.get("/admin/revenue-stats", async (req, res, next) => {
    try {
        const { period = "month" } = req.query; // month, week, day

        let startDate = new Date();
        if (period === "day") {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === "week") {
            const day = startDate.getDay();
            startDate.setDate(startDate.getDate() - day);
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        // Total revenue
        const orders = await Order.find({
            status: { $in: ["PAID", "SHIPPING", "DELIVERED", "COMPLETED"] },
            createdAt: { $gte: startDate }
        });
        const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);

        // Orders by status
        const allOrders = await Order.find();
        const orderByStatus = {
            PAID: allOrders.filter(o => ["PAID", "SHIPPING", "DELIVERED", "COMPLETED"].includes(o.status)).length,
            PENDING: allOrders.filter(o => ["PENDING", "CONFIRMED"].includes(o.status)).length,
            CANCELLED: allOrders.filter(o => o.status === "CANCELLED").length,
            FAILED: allOrders.filter(o => o.status === "FAILED").length
        };

        // Top products
        const topProducts = await OrderItem.aggregate([
            {
                $match: {
                    order: { $in: orders.map(o => o._id) }
                }
            },
            {
                $group: {
                    _id: "$productVariant",
                    totalQuantity: { $sum: "$quantity" },
                    totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "productvariants",
                    localField: "_id",
                    foreignField: "_id",
                    as: "variant"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "variant.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $project: {
                    _id: 0,
                    variantId: "$_id",
                    productName: { $arrayElemAt: ["$product.name", 0] },
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        // Revenue by payment method
        const revenueByMethod = {
            COD: orders.filter(o => o.paymentMethod === "COD").reduce((sum, o) => sum + o.finalAmount, 0),
            MOMO: orders.filter(o => o.paymentMethod === "MOMO").reduce((sum, o) => sum + o.finalAmount, 0)
        };

        res.json({
            period,
            totalRevenue,
            orderByStatus,
            topProducts: topProducts.map(p => ({
                ...p,
                variantId: String(p.variantId)
            })),
            revenueByMethod,
            ordersCount: orders.length
        });
    } catch (e) { next(e); }
});

// ── USERS (public get by ID) ──────────────────────────────────────────────────

// PUT /api/users/:id
router.put("/users/:id", async (req, res, next) => {
    try {
        const { fullName, phone, avatarUrl } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, phone, avatarUrl },
            { new: true }
        ).populate("role");
        if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });
        const obj = user.toObject();
        res.json({
            id: obj._id,
            username: obj.username,
            email: obj.email,
            fullName: obj.fullName || "",
            phone: obj.phone || "",
            avatarUrl: obj.avatarUrl || "",
            role: obj.role ? { code: obj.role.code, name: obj.role.name } : null
        });
    } catch (e) { next(e); }
});

// ── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/admin/products
router.get("/admin/products", async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate("category").sort({ createdAt: -1 });
        res.json(fmtAll(products));
    } catch (e) { next(e); }
});

// POST /api/admin/products
router.post("/admin/products", async (req, res, next) => {
    try {
        const { name, description, imageUrl, category } = req.body;
        const createData = { name, description, imageUrl };
        
        // Only add category if it has a valid ID
        if (category) {
            const categoryId = typeof category === 'string' ? category : category?.id;
            if (categoryId && categoryId !== 'null') {
                createData.category = categoryId;
            }
        }
        
        const product = await Product.create(createData);
        const populated = await Product.findById(product._id).populate("category");
        res.status(201).json(fmt(populated));
    } catch (e) { next(e); }
});

// PUT /api/admin/products/:id
router.put("/admin/products/:id", async (req, res, next) => {
    try {
        const { name, description, imageUrl, category } = req.body;
        const updateData = { name, description, imageUrl };
        
        // Only update category if it has a valid ID
        if (category) {
            const categoryId = typeof category === 'string' ? category : category?.id;
            if (categoryId && categoryId !== 'null') {
                updateData.category = categoryId;
            } else {
                updateData.category = null;
            }
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate("category");
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        res.json(fmt(product));
    } catch (e) { next(e); }
});

// DELETE /api/admin/products/:id
router.delete("/admin/products/:id", async (req, res, next) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
        res.json({ message: "Đã xóa sản phẩm" });
    } catch (e) { next(e); }
});

// GET /api/admin/categories
router.get("/admin/categories", async (req, res, next) => {
    try {
        const categories = await Category.find({ isDeleted: false }).sort({ name: 1 });
        res.json(fmtAll(categories));
    } catch (e) { next(e); }
});

// POST /api/admin/categories
router.post("/admin/categories", async (req, res, next) => {
    try {
        const category = await Category.create({ name: req.body.name, description: req.body.description });
        res.status(201).json(fmt(category));
    } catch (e) { next(e); }
});

// PUT /api/admin/categories/:id
router.put("/admin/categories/:id", async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ error: "Không tìm thấy danh mục" });
        res.json(fmt(category));
    } catch (e) { next(e); }
});

// DELETE /api/admin/categories/:id
router.delete("/admin/categories/:id", async (req, res, next) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
        res.json({ message: "Đã xóa danh mục" });
    } catch (e) { next(e); }
});

// GET /api/admin/product-variants
router.get("/admin/product-variants", async (req, res, next) => {
    try {
        const variants = await ProductVariant.find()
            .populate({ path: "product", populate: { path: "category" } })
            .populate("color").populate("size")
            .sort({ createdAt: -1 });
        res.json(fmtAll(variants));
    } catch (e) { next(e); }
});

// POST /api/admin/product-variants
router.post("/admin/product-variants", async (req, res, next) => {
    try {
        const { product, color, size, name, sku, price, stock } = req.body;
        
        const getValue = (val) => {
            if (!val) return null;
            const id = typeof val === 'string' ? val : val?.id;
            return (id && id !== 'null') ? id : null;
        };
        
        const createData = {
            name, sku,
            price: Number(price),
            stock: Number(stock || 0)
        };
        
        const productId = getValue(product);
        const colorId = getValue(color);
        const sizeId = getValue(size);
        
        if (productId) createData.product = productId;
        if (colorId) createData.color = colorId;
        if (sizeId) createData.size = sizeId;
        
        const variant = await ProductVariant.create(createData);
        const populated = await ProductVariant.findById(variant._id)
            .populate({ path: "product", populate: { path: "category" } })
            .populate("color").populate("size");
        res.status(201).json(fmt(populated));
    } catch (e) { next(e); }
});

// PUT /api/admin/product-variants/:id
router.put("/admin/product-variants/:id", async (req, res, next) => {
    try {
        const { product, color, size, name, sku, price, stock } = req.body;
        
        const getValue = (val) => {
            if (!val) return null;
            const id = typeof val === 'string' ? val : val?.id;
            return (id && id !== 'null') ? id : null;
        };
        
        const updateData = {
            name, sku,
            price: Number(price),
            stock: Number(stock || 0)
        };
        
        const productId = getValue(product);
        const colorId = getValue(color);
        const sizeId = getValue(size);
        
        if (productId) updateData.product = productId;
        if (colorId) updateData.color = colorId;
        if (sizeId) updateData.size = sizeId;
        
        const variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate({ path: "product", populate: { path: "category" } }).populate("color").populate("size");
        if (!variant) return res.status(404).json({ error: "Không tìm thấy biến thể" });
        res.json(fmt(variant));
    } catch (e) { next(e); }
});

// DELETE /api/admin/product-variants/:id
router.delete("/admin/product-variants/:id", async (req, res, next) => {
    try {
        await ProductVariant.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
        res.json({ message: "Đã xóa biến thể" });
    } catch (e) { next(e); }
});

// GET /api/admin/users
router.get("/admin/users", async (req, res, next) => {
    try {
        const users = await User.find().populate("role").sort({ createdAt: -1 });
        res.json(users.map(u => {
            const obj = u.toObject();
            return {
                id: obj._id,
                username: obj.username,
                email: obj.email,
                fullName: obj.fullName || "",
                phone: obj.phone || "",
                avatarUrl: obj.avatarUrl || "",
                isActive: obj.isActive,
                role: obj.role ? { id: obj.role._id, code: obj.role.code, name: obj.role.name } : null,
                createdAt: obj.createdAt
            };
        }));
    } catch (e) { next(e); }
});

// POST /api/admin/users
router.post("/admin/users", async (req, res, next) => {
    try {
        const { username, email, password, fullName, phone, role } = req.body;
        const roleCode = role?.code || "USER";
        let roleDoc = await Role.findOne({ code: roleCode });
        if (!roleDoc) roleDoc = await Role.findOne({ code: "USER" });

        const user = await User.create({
            username: username?.toLowerCase(),
            email: email?.toLowerCase(),
            password: password || "password123",
            fullName, phone,
            role: roleDoc?._id
        });
        const populated = await User.findById(user._id).populate("role");
        const obj = populated.toObject();
        res.status(201).json({
            id: obj._id, username: obj.username, email: obj.email,
            fullName: obj.fullName, phone: obj.phone,
            role: obj.role ? { id: obj.role._id, code: obj.role.code, name: obj.role.name } : null
        });
    } catch (e) { next(e); }
});

// PUT /api/admin/users/:id
router.put("/admin/users/:id", async (req, res, next) => {
    try {
        const { username, email, fullName, phone, role, password } = req.body;
        const roleCode = role?.code || "USER";
        const roleDoc = await Role.findOne({ code: roleCode });

        const updateData = { username: username?.toLowerCase(), email: email?.toLowerCase(), fullName, phone };
        if (roleDoc) updateData.role = roleDoc._id;

        if (password) {
            updateData.password = await require("bcryptjs").hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("role");
        if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
        const obj = user.toObject();
        res.json({
            id: obj._id, username: obj.username, email: obj.email,
            fullName: obj.fullName, phone: obj.phone,
            role: obj.role ? { id: obj.role._id, code: obj.role.code, name: obj.role.name } : null
        });
    } catch (e) { next(e); }
});

// DELETE /api/admin/users/:id
router.delete("/admin/users/:id", async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa người dùng" });
    } catch (e) { next(e); }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put("/admin/orders/:id/status", async (req, res, next) => {
    try {
        const { status, expectedDeliveryDate } = req.body;
        if (status && !["PENDING", "CONFIRMED", "PAID", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED", "FAILED"].includes(status)) {
            return res.status(400).json({ error: "Trạng thái không hợp lệ" });
        }
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        if (status && order.status !== status) {
            order.status = status;
            order.statusHistory.push({ status, changedAt: new Date() });
        }
        if (expectedDeliveryDate !== undefined) {
            order.expectedDeliveryDate = expectedDeliveryDate;
        }

        await order.save();
        res.json(fmt(order));
    } catch (e) { next(e); }
});

// GET /api/admin/coupons
router.get("/admin/coupons", async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(fmtAll(coupons));
    } catch (e) { next(e); }
});

// GET /api/admin/colors
router.get("/admin/colors", async (req, res, next) => {
    try {
        const colors = await Color.find({ isDeleted: false }).sort({ name: 1 });
        res.json(fmtAll(colors));
    } catch (e) { next(e); }
});

// POST /api/admin/colors
router.post("/admin/colors", async (req, res, next) => {
    try {
        const { name, hexcode } = req.body;
        const color = await Color.create({ name, hexcode });
        res.status(201).json(fmt(color));
    } catch (e) { next(e); }
});

// PUT /api/admin/colors/:id
router.put("/admin/colors/:id", async (req, res, next) => {
    try {
        const { name, hexcode } = req.body;
        const color = await Color.findByIdAndUpdate(
            req.params.id,
            { name, hexcode },
            { new: true, runValidators: true }
        );
        if (!color) return res.status(404).json({ error: "Không tìm thấy màu" });
        res.json(fmt(color));
    } catch (e) { next(e); }
});

// DELETE /api/admin/colors/:id
router.delete("/admin/colors/:id", async (req, res, next) => {
    try {
        await Color.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
        res.json({ message: "Đã xóa màu" });
    } catch (e) { next(e); }
});

// GET /api/admin/sizes
router.get("/admin/sizes", async (req, res, next) => {
    try {
        const sizes = await Size.find({ isDeleted: false }).sort({ name: 1 });
        res.json(fmtAll(sizes));
    } catch (e) { next(e); }
});

// POST /api/admin/sizes
router.post("/admin/sizes", async (req, res, next) => {
    try {
        const { name } = req.body;
        const size = await Size.create({ name });
        res.status(201).json(fmt(size));
    } catch (e) { next(e); }
});

// PUT /api/admin/sizes/:id
router.put("/admin/sizes/:id", async (req, res, next) => {
    try {
        const { name } = req.body;
        const size = await Size.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );
        if (!size) return res.status(404).json({ error: "Không tìm thấy kích cỡ" });
        res.json(fmt(size));
    } catch (e) { next(e); }
});

// DELETE /api/admin/sizes/:id
router.delete("/admin/sizes/:id", async (req, res, next) => {
    try {
        await Size.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
        res.json({ message: "Đã xóa kích cỡ" });
    } catch (e) { next(e); }
});

export default router;
