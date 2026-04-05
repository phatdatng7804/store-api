import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

export default mongoose.model("Size", sizeSchema);