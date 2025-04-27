import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  getUsers,
  getUser,
  updateUserImage,
  toggleFollower,
  updateUser,
  getMasks,
} from "../controllers/user.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const userRouter = Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUser);
userRouter.get("/:id/masks", authorize, getMasks);

userRouter.patch("/:id/edit", authorize, upload.single("image"), updateUser);

userRouter.post("/:id/follow", authorize, toggleFollower);

userRouter.put("/:id/image", updateUserImage);

userRouter.delete("/:id", (req, res) => {
  res.send({ title: "DELETE user" });
});

export default userRouter;
