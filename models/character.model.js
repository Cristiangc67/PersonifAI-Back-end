import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Character name required"],
      minLength: 2,
      maxLength: 50,
    },
    nameCharacter: {
      type: String,
      required: [true, "Character nameCharacter required"],
      minLength: 2,
      maxLength: 50,
    },
    description: {
      type: String,
      maxLength: 1000,
    },
    cardDescription: {
      type: String,
      maxLength: 1000,
    },
    firstMessage: String,
    personality: String,
    appearance: String,
    scenario: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    characterPicture: { type: String, default: null },
  },
  { timestamps: true }
);

const Character = mongoose.model("Character", characterSchema);

export default Character;
