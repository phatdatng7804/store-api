import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    productVariant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
    },
    quantity:{
        type: Number,
    },
    price:{
        type: Number,
    }
})

export default mongoose.model("OrderItem", orderItemSchema);    