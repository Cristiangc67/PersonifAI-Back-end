import mongoose from "mongoose";
import Conversation from "./conversation.model.js";

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
    description: String,
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
characterSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const characterId = this._id;
  const conversations = await Conversation.find({ character: characterId });

  for (const conv of conversations) {
    await conv.deleteOne();
  }

  next();
});

const Character = mongoose.model("Character", characterSchema);

export default Character;
