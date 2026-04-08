import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    active: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
<<<<<<< HEAD
    deletedAt: {
=======
    deletedAt:{
>>>>>>> bf292fd2b335bd508bcdba3d65c5f66857686a09
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);