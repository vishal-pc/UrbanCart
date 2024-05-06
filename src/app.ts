import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import figlet from "figlet";
import { configCors } from "./config/corsConfig";
import { SuccessMessages, ErrorMessages } from "./validation/responseMessages";

const app = express();

import authRoute from "./auth/routes/routes";
import adminRouter from "./admin/routes/routes";
import loginRouter from "./login/loginRoutes";

app.use(configCors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/v1/login", loginRouter);
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
