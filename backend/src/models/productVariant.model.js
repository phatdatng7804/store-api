import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    size:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
    },
    color:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
    },
    price:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default: null
    }
}, {timestamps: true})

export default mongoose.model("ProductVariant", productVariantSchema);
