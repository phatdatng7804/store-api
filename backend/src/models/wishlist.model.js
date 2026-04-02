import mongoose from "mongoose";


const wishlistSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    productVariant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
    },
}, {timestamps: true})

export default mongoose.model("Wishlist", wishlistSchema);