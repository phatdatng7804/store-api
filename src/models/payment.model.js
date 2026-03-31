import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    amount:{
        type: Number,
        required: true
    },
    paymentMethod:{
        type: String,
        enum: ["cod", "paypal", "stripe"],
    },
    status:{
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    }
}, {timestamps: true})

export default mongoose.model("Payment", paymentSchema);