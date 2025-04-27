import mongoose from "mongoose";
import Character from "../models/character.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET } from "../config/env.js";
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET,
});

export const createCharacter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      nameCharacter,
      description,
      firstMessage,
      personality,
      appearance,
      scenario,
      creator,
      cardDescription,
    } = req.body;

    const [newCharacter] = await Character.create(
      [
        {
          name,
          nameCharacter,
          description,
          firstMessage,
          personality,
          appearance,
          scenario,
          creator,
          cardDescription,
        },
      ],
      { session }
    );

    let characterPicture = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            upload_preset: "personifAICard",
            public_id: newCharacter._id.toString(),
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      characterPicture = uploadResult.secure_url;

      newCharacter.characterPicture = characterPicture;
      await newCharacter.save({ session });
    }

    await User.findByIdAndUpdate(
      creator,
      { $push: { createdCharacters: newCharacter._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Character created successfully",
      data: { character: newCharacter },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    next(error);
  }
};

export const getCharacter = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id).populate(
      "creator",
      "username"
    );
    if (!character) {
      const error = new Error("Character not found");
      error.statusCode = 404;

      throw error;
    }
    res.status(200).json({ success: true, data: character });
  } catch (err) {
    console.log(err);
  }
};
export const getCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find().populate("creator", "username");

    res.status(200).json({ success: true, data: characters });
  } catch (error) {
    next(error);
  }
};
export const updateCharacter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const character = await Character.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        nameCharacter: req.body.nameCharacter,
        description: req.body.description,
        firstMessage: req.body.firstMessage,
        personality: req.body.personality,
        appearance: req.body.appearance,
        scenario: req.body.scenario,
        cardDescription: req.body.cardDescription,
      },
      { new: true },
      { session }
    );

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            upload_preset: "personifAICard",
            public_id: character._id.toString(),
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      character.characterPicture = `${uploadResult.secure_url}?v=${uploadResult.version}`;

      await character.save({ session });
    }
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: character });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const deleteCharacter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const result = await cloudinary.uploader.destroy(`cards/${id}`);
    console.log("Result:", result);

    const toErase = await Character.findById(id, { session });
    if (!toErase) {
      throw new Error("Personaje no encontrado");
    }
    await User.findByIdAndUpdate(
      erased.creator._id,
      { $pull: { createdCharacters: id } },
      { session }
    );

    await Character.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "personaje eliminado" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
