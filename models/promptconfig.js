import mongoose from "mongoose";

const PromptConfigSchema = new mongoose.Schema({
  promptpayId: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: false,
  },
});

export default mongoose.models.PromptConfig || mongoose.model("PromptConfig", PromptConfigSchema);