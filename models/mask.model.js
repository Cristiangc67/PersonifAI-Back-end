import mongoose from "mongoose";

const maskSchema = new mongoose.Schema({
  name: { type: String, required: [true, "mask name required"] },
  description: String,
},{ timestamps: true });

const Mask = mongoose.model("Mask", maskSchema);

export default Mask;
