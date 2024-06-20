import express from "express";
import * as loginController from "../login/loginController";
import { verifyAuthToken } from "../middleware/token/authMiddleware";

const loginRouter = express.Router();

loginRouter.post("/user-login", loginController.authLogin);

export default loginRouter;
