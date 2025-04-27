import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mask: { type: mongoose.Schema.Types.ObjectId, ref: "Mask", required: true },
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Character",
    required: true,
  },
  provider: {
    type: String,
    enum: ["openai", "gemini", "deepseek"],
    required: true,
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
