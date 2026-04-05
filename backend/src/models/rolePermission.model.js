import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("RolePermission", rolePermissionSchema);
