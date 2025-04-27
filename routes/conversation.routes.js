import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  getOrCreateLatestConversation,
  getConversation,
  messageAdd,
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

export default conversationRouter;
