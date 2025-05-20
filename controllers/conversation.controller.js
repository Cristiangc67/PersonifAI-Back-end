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
    const { userId, characterId, provider, mask, isFromChat } = req.body;

    let conversation = await Conversation.findOne({
      user: userId,
      character: characterId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    if (!conversation || isFromChat) {
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



      const conversationArr = await Conversation.create(
        [{
          user: userId,
          mask,
          character: characterId,
          provider,
          messages: [], 
        }],
        { session }
      );
      conversation = conversationArr[0];
      const messageDoc = await Message.create(
        [{
          role: "user",
          parts: [{ text: firstText }],
          conversationId: conversation._id
        }],
        { session }
      );

      const messageCharacter = await Message.create(
        [{
          role: "model",
          parts: [{ text: characterToChat.firstMessage }],
          conversationId: conversation._id
        }],
        { session }
      );
      conversation.messages.push(messageDoc[0]._id, messageCharacter[0]._id);
      await conversation.save({ session });



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
      [{ conversationId: conversationId, role: role, parts: [{ text: text }] }],
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
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(characterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or characterId",
      });
    }


    const conversations = await Conversation.find({
      user: new mongoose.Types.ObjectId(userId),
      character: new mongoose.Types.ObjectId(characterId),
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

export const deleteConversation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId).session(session);

    if (!conversation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

   
    await conversation.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Conversation and related messages deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
