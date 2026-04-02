import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    shippingAddress:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAddress",
    },
    totalAmount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    note:{
        type: String,
        trim: true
    }
}, {timestamps: true})

export default mongoose.model("Order", orderSchema);