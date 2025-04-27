import { Router } from "express";
import {
  createCharacter,
  getCharacters,
  getCharacter,
  updateCharacter,
  deleteCharacter,
} from "../controllers/character.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import authorizeCharacterOwner from "../middlewares/authCharOwner.middleware.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const characterRouter = Router();

characterRouter.post("/", authorize, upload.single("image"), createCharacter);
characterRouter.get("/:id", getCharacter);
characterRouter.get("/", getCharacters);
characterRouter.patch(
  "/:id",
  authorize,
  authorizeCharacterOwner,
  upload.single("image"),
  updateCharacter
);
characterRouter.delete("/:id", authorize, deleteCharacter);

export default characterRouter;
