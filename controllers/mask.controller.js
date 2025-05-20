import mongoose from "mongoose";
import Mask from "../models/mask.model.js";
import User from "../models/user.model.js";

export const createMask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, description, userId } = req.body;

 
    if (!name || !userId) {
      throw new Error("Name and userId are required");
    }


    const [mask] = await Mask.create([{ name, description }], { session });


    await User.findByIdAndUpdate(
      userId,
      { $push: { masks: mask._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Mask created successfully",
      data: mask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(); 
  }
};

export const deleteMask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId } = req.body;


    if (!userId) {
      throw new Error("User ID is required");
    }


    const mask = await Mask.findById(id).session(session);
    if (!mask) {
      throw new Error("Máscara no encontrada");
    }

  
    await User.findByIdAndUpdate(userId, { $pull: { masks: id } }, { session });

    await Mask.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Máscara eliminada" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const updateMask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { name, description } = req.body;


    const mask = await Mask.findById(id).session(session);
    if (!mask) {
      throw new Error("Máscara no encontrada");
    }

    const newMask = await Mask.findByIdAndUpdate(
      id,
      { name, description },
      { new: true },
      { session }
    );


    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: "Máscara actualizada", data: newMask });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
