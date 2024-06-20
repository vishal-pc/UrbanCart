import express from "express";
import * as loginController from "../login/loginController";

const loginRouter = express.Router();

loginRouter.post("/user-login", loginController.authLogin);

loginRouter.post("/google", loginController.googlelogin);

export default loginRouter;
