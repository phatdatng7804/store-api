import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
    },
    name :{
        type: String,
        required: true,
        trim: true
    },
    role:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },
    gender:{
        type: Number,
        enum: [0, 1, 2], // 0 = male, 1 = female, 2 = other
        default: null
    },
    phone:{
        type: String,
        trim: true,
        default: null
    },
    refreshToken:{
        type: String,
        default: null
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

// Tự động hash password trước khi save
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method so sánh password (dùng cho login sau này)
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
