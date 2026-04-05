import mongoose from "mongoose";

const userAddressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    street:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    district:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    isDefault:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})

export default mongoose.model("UserAddress", userAddressSchema);