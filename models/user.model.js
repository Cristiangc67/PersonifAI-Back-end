import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "User username is required"],
      unique: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, "User Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 6,
    },
    createdCharacters: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
    ],
    subscriptionPlan: {
      type: String,
      enum: ["free", "turing", "premium"],
      default: "free",
    },
    masks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mask" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
