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
    }
})

export default mongoose.model("Color", colorSchema);    