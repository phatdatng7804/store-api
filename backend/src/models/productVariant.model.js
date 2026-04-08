import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
    },
    name: {
        type: String,
        trim: true,
        default: ""
    },
    sku: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
<<<<<<< HEAD
        required: true,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
=======
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
>>>>>>> bf292fd2b335bd508bcdba3d65c5f66857686a09
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("ProductVariant", productVariantSchema);
