import User from "../models/user.model.js";
import Mask from "../models/mask.model.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET } from "../config/env.js";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -subscriptionPlan -masks -apiKeys")
      .populate("createdCharacters")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserImage = async (req, res, next) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            upload_preset: "personifAIProfile",
            public_id: req.params.id,
          },
          async (error, result) => {
            if (error) {
              return next(error);
            }

            const user = await User.findByIdAndUpdate(
              req.params.id,
              { profilePicture: result.secure_url },
              { new: true }
            );

            if (!user) {
              const error = new Error("User not found");
              error.statusCode = 404;
              return next(error);
            }

            res
              .status(200)
              .json({ message: "Image uploaded successfully", user });
          }
        )
        .end(req.file.buffer);
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  console.log(req.body);
  session.startTransaction();
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        email: req.body.email,
      },
      { new: true, session }
    );
    console.log(user);
    console.log(req.body.username);
    console.log(req.body.email);

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            upload_preset: "personifAIProfile",
            public_id: user._id.toString(),
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      user.profilePicture = `${uploadResult.secure_url}?v=${uploadResult.version}`;

      await user.save({ session });
    }
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const toggleFollower = async (req, res, next) => {
  try {
    if (req.body.follower === req.params.id) {
      return console.log("You can't follow yourself");
    }
    const follower = await User.findById(req.body.follower);
    const user = await User.findById(req.params.id);

    if (!follower || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.followers.includes(req.body.follower)) {
      console.log("Ya sigues a este usuario");

      follower.following = follower.following.filter(
        (userId) => userId.toString() !== req.params.id
      );
      user.followers = user.followers.filter(
        (userId) => userId.toString() !== req.body.follower
      );

      console.log("Ya seguias a este usuario, ya no lo sigues mas");
    } else {
      user.followers.push(follower);
      follower.following.push(user);
    }

    await user.save();
    await follower.save();

    res.status(200).json({ message: "Usuario seguido con exito" });
  } catch (error) {
    console.log(error);
    console.log("**************error al agregar follower******************");
  }
};

export const getMasks = async (req, res, next) => {
  try {
    const userMasks = await User.findById(req.params.id)
      .select("masks")
      .populate("masks");

    if (!userMasks) {
      const error = new Error("User not found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ success: true, data: userMasks });
  } catch (error) {
    next(error);
  }
};
