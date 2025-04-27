import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subscription is required"],
    trim: true,
    minLength: 2,
    maxLength: 100,
  },
  price: {
    type: number,
    required: [true, "subscription price is required"],
    min: [0, "price must be greater than 0"],
  },
  frequency: {
    type: String,
    enum: ["daily,weekly,monthly", "yearly"],
  },
});
