import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    hexcode:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
<<<<<<< HEAD
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
=======
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
>>>>>>> bf292fd2b335bd508bcdba3d65c5f66857686a09
        type: Date,
        default: null
    }
}, {timestamps: true})

export default mongoose.model("Color", colorSchema);