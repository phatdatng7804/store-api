import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverName: {
        type: String,
        trim: true
    },
    receiverPhone: {
        type: String,
        trim: true
    },
    shippingAddress: {
        type: String,
        trim: true
    },
    note: {
        type: String,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    couponCode: {
        type: String,
        default: ""
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    expectedDeliveryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "PAID", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED", "FAILED"],
        default: "PENDING"
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "MOMO"],
        default: "COD"
    },
    momoOrderId: {
        type: String,
        default: ""
    },
    momoTransId: {
        type: String,
        default: ""
    },
    statusHistory: [{
        status: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);