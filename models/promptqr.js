import mongoose from "mongoose";

const promptQRSchema = new mongoose.Schema({
  ref: { type: String, required: true, unique: true },
  amount: Number,
  expiresAt: Date,
  used: { type: Boolean, default: false },
});

export default mongoose.models.PromptQR || mongoose.model("PromptQR", promptQRSchema);
