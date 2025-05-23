import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import cors from "cors";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import maskRouter from "./routes/mask.routes.js";
import characterRouter from "./routes/character.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import connectToDatabase from "./database/mongodb.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: "https://personif-ai-front-end.vercel.app",
    credentials: true,
  }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/masks", maskRouter);
app.use("/api/v1/character", characterRouter);
app.use("/api/v1/conversations", conversationRouter);

app.listen(PORT, async () => {
  console.log(`server running on port ${PORT}`);
  await connectToDatabase();
});

app.get("/", (req, res) => {
  res.send("HOLA NODE");
});
