import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    totalAmount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending"
    }
}, {timestamps: true})

export default mongoose.model("Order", orderSchema);    