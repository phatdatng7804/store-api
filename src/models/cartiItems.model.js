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
    }
})

export default mongoose.model("CartItem", cartItemSchema);    