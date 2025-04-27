import mongoose from "mongoose";

const maskSchema = new mongoose.Schema({
  name: { type: String, required: [true, "mask name required"] },
  description: String,
});

const Mask = mongoose.model("Mask", maskSchema);

export default Mask;
