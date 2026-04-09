import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    productVariant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("OrderItem", orderItemSchema);