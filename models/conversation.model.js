import mongoose from "mongoose";
import Message from "./message.model.js";

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
    enum: ["openai", "gemini", "deepseek","llama"],
    required: true,
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
},{ timestamps: true });

conversationSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await Message.deleteMany({ conversationId: this._id });
  next();
});


const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
