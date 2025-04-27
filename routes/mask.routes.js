import { Router } from "express";
import {
  createMask,
  updateMask,
  deleteMask,
} from "../controllers/mask.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const maskRouter = Router();

// path
maskRouter.post("/", authorize, createMask);
maskRouter.delete("/:id", deleteMask);
maskRouter.put("/:id", updateMask);

export default maskRouter;
