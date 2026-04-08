import { Router } from "express";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Category from "../models/category.model.js";
import Color from "../models/color.model.js";
import Size from "../models/size.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import Role from "../models/role.model.js";

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

// ── MOMO (stub) ──────────────────────────────────────────────────────────────

// POST /api/momo/create-payment
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
            momoOrderId: `MOMO_${Date.now()}`
        });

        await Promise.all(items.map(item =>
            OrderItem.create({
                order: order._id,
                productVariant: item.productVariant._id,
                quantity: item.quantity,
                price: item.productVariant.price
            })
        ));

        // In sandbox mode we just simulate a successful payment
        // Real MoMo integration would redirect to payUrl
        const momoOrderId = order.momoOrderId;

        // Simulate MoMo - return a fake payUrl for demo
        const payUrl = `http://127.0.0.1:5173/payment-result?orderId=${momoOrderId}&resultCode=0&transId=TEST${Date.now()}&message=Success`;

        res.json({
            orderId: order._id,
            momoOrderId,
            payUrl,
            message: "Tạo thanh toán MoMo thành công (sandbox)"
        });
    } catch (e) { next(e); }
});

// GET /api/momo/result
router.get("/momo/result", async (req, res, next) => {
    try {
        const { orderId, resultCode, transId } = req.query;

        // Find order by momoOrderId
        const order = await Order.findOne({ momoOrderId: orderId });
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        if (resultCode === "0" || resultCode === 0) {
            // Payment success
            order.status = "PAID";
            order.momoTransId = transId || "";
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
        const categoryId = category?.id || category;
        const product = await Product.create({ name, description, imageUrl, category: categoryId || null });
        const populated = await Product.findById(product._id).populate("category");
        res.status(201).json(fmt(populated));
    } catch (e) { next(e); }
});

// PUT /api/admin/products/:id
router.put("/admin/products/:id", async (req, res, next) => {
    try {
        const { name, description, imageUrl, category } = req.body;
        const categoryId = category?.id || category;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, imageUrl, category: categoryId || null },
            { new: true, runValidators: true }
        ).populate("category");
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        res.json(fmt(product));
    } catch (e) { next(e); }
});

// DELETE /api/admin/products/:id
router.delete("/admin/products/:id", async (req, res, next) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Đã xóa sản phẩm" });
    } catch (e) { next(e); }
});

// GET /api/admin/categories
router.get("/admin/categories", async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
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
        await Category.findByIdAndDelete(req.params.id);
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
        const variant = await ProductVariant.create({
            product: product?.id || product,
            color: color?.id || color,
            size: size?.id || size,
            name, sku,
            price: Number(price),
            stock: Number(stock || 0)
        });
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
        const variant = await ProductVariant.findByIdAndUpdate(
            req.params.id,
            {
                product: product?.id || product,
                color: color?.id || color,
                size: size?.id || size,
                name, sku,
                price: Number(price),
                stock: Number(stock || 0)
            },
            { new: true, runValidators: true }
        ).populate({ path: "product", populate: { path: "category" } }).populate("color").populate("size");
        if (!variant) return res.status(404).json({ error: "Không tìm thấy biến thể" });
        res.json(fmt(variant));
    } catch (e) { next(e); }
});

// DELETE /api/admin/product-variants/:id
router.delete("/admin/product-variants/:id", async (req, res, next) => {
    try {
        await ProductVariant.findByIdAndDelete(req.params.id);
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
        const { username, email, fullName, phone, role } = req.body;
        const roleCode = role?.code || "USER";
        const roleDoc = await Role.findOne({ code: roleCode });

        const updateData = { username: username?.toLowerCase(), email: email?.toLowerCase(), fullName, phone };
        if (roleDoc) updateData.role = roleDoc._id;

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

// GET /api/admin/colors
router.get("/admin/colors", async (req, res, next) => {
    try {
        const colors = await Color.find().sort({ name: 1 });
        res.json(fmtAll(colors));
    } catch (e) { next(e); }
});

// GET /api/admin/sizes
router.get("/admin/sizes", async (req, res, next) => {
    try {
        const sizes = await Size.find().sort({ name: 1 });
        res.json(fmtAll(sizes));
    } catch (e) { next(e); }
});

export default router;
