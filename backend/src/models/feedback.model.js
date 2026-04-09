import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  fullName: { type: String, trim: true, required: true, maxlength: 120 },
  phone: { type: String, trim: true, default: "", maxlength: 30 },
  email: { type: String, trim: true, default: "", maxlength: 200 },
  subject: { type: String, trim: true, default: "Khác", maxlength: 120 },
  message: { type: String, trim: true, required: true, maxlength: 4000 },

  source: { type: String, trim: true, default: "contact" }, // contact | other
  status: { type: String, enum: ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"], default: "NEW" },
  adminNote: { type: String, trim: true, default: "", maxlength: 2000 },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

feedbackSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);

