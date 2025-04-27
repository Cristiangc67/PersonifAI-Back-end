import { Router } from "express";
import { signUp, logIn } from "../controllers/auth.controller.js";

const authRouter = Router();

// path
authRouter.post("/sign-up", signUp);
authRouter.post("/log-in", logIn);

export default authRouter;
