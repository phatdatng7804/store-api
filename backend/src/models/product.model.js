import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug:{
        type: String,
        unique: true,
        trim: true,
        lowercase: true
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
    images:[{
        type: String
    }],
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default: null
    }
}, {timestamps: true})

export default mongoose.model("Product", productSchema);