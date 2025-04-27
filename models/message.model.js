import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  content: String,
  parts: [{ _id: false, text: String }],
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

export default Message;
