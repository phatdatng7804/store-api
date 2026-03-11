import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema({
    role:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },
    permission:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
    }
})

export default mongoose.model("RolePermission", rolePermissionSchema);