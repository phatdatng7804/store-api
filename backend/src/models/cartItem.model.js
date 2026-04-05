import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
    },
    productVariant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
    },
    quantity:{
        type: Number,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

export default mongoose.model("CartItem", cartItemSchema);
