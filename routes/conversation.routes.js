import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  getOrCreateLatestConversation,
  getConversation,
  messageAdd,
  getUserCharacterConversations,
} from "../controllers/conversation.controller.js";
const conversationRouter = Router();

conversationRouter.post("/");
conversationRouter.patch("/:id", messageAdd);
conversationRouter.post(
  "/get-or-create",
  authorize,
  getOrCreateLatestConversation
);
conversationRouter.get("/:id", getConversation);
conversationRouter.get("/user-character/:id", getUserCharacterConversations);

export default conversationRouter;
