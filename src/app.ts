import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import figlet from "figlet";
import { configCors } from "./config/corsConfig";
import { SuccessMessages, ErrorMessages } from "./validation/responseMessages";
import passport from 'passport';
import Session from 'express-session';

const app = express();

import authRoute from "./auth/routes/routes";
import adminRouter from "./admin/routes/routes";
import loginRouter from "./login/loginRoutes";
import googleRouter from "./socialLogin/google/googleRoute"
import webhookRoute from "./auth/routes/webhookRoute";

app.use("/stripe", webhookRoute);

const sessionSecret = process.env.sessionSecret || "defaultSecret";
app.use(Session({
  secret :sessionSecret,
  resave :  false,
  saveUninitialized : true,
  cookie : {secure:false},
}))

app.use(configCors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/login", loginRouter);
app.use("/auth", googleRouter);
app.use("/api/v1/user", authRoute);
app.use("/api/v1/admin", adminRouter);

app.get("/", (req: Request, res: Response) => {
  figlet.text(
    SuccessMessages.SampelResponse,
    {
      font: "Ghost",
    },
    function (err: any, data: any) {
      if (err) {
        res.send(ErrorMessages.SomethingWentWrong);
      }
      res.send(`<pre>${data}</pre>`);
    }
  );
});

export default app;
