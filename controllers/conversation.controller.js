import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Character from "../models/character.model.js";
import Mask from "../models/mask.model.js";
import Message from "../models/message.model.js";
import { defineCharacter } from "../utils/utils.js";

export const postConversation = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { user, character, provider, mask } = req.body;
    const characterToChat = await Character.findById(character);
    const firstText = defineCharacter(
      characterToChat.nameCharacter,
      characterToChat.description,
      characterToChat.appearance,
      characterToChat.personality,
      characterToChat.scenario,
      mask
    );

    const initialMessages = [{ role: "user", parts: [{ text: firstText }] }];

    const conversation = await Conversation.create(
      [{ user, character, provider, messages: [initialMessages] }],
      { session }
    );

    session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      message: "conversacion creada",
      data: { conversation },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};
export const getOrCreateLatestConversation = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, characterId, provider, mask } = req.body;

    let conversation = await Conversation.findOne({
      user: userId,
      character: characterId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    if (!conversation) {
      console.log("si no existe", characterId);
      const selectedMask = await Mask.findById(mask);

      const characterToChat = await Character.findById(characterId);

      const firstText = defineCharacter(
        characterToChat.nameCharacter,
        characterToChat.description,
        characterToChat.appearance,
        characterToChat.personality,
        characterToChat.scenario,
        selectedMask
      );

      const messageDoc = await Message.create(
        [{ role: "user", parts: [{ text: firstText }] }],
        { session }
      );
      const messageCharacter = await Message.create(
        [{ role: "model", parts: [{ text: characterToChat.firstMessage }] }],
        { session }
      );

      const conversationArr = await Conversation.create(
        [
          {
            user: userId,
            mask,
            character: characterId,
            provider,
            messages: [messageDoc[0]._id, messageCharacter[0]._id],
          },
        ],
        { session }
      );
      conversation = conversationArr[0];
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Conversación creada",
      data: { conversation },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId)
      .populate("mask")
      .populate("character")
      .populate("messages");
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation obtained",
      data: conversation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const messageAdd = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { role, text } = req.body;
    const conversationId = req.params.id;
    const newMessage = await Message.create(
      [{ role: role, parts: [{ text: text }] }],
      { session }
    );
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: newMessage[0]._id } },
      { new: true, session }
    );
    if (!conversation) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserCharacterConversations = async (req, res) => {
  try {
    const characterId = req.query.characterId;
    const userId = req.params.id;
    const conversations = await Conversation.find({
      user: userId,
      character: characterId,
    })
      .select("_id createdAt")
      .sort({ createdAt: -1 });
    if (!conversations) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation obtained",
      data: conversations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
