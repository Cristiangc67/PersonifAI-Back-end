import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, enum: ["user", "model"], required: true },
  parts: [{ _id: false, text: String }],
},{ timestamps: true });
const Message = mongoose.model("Message", messageSchema);

export default Message;
