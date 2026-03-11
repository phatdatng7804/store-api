import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    price:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
})

export default mongoose.model("Product", productSchema);    