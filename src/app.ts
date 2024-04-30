import { SuccessMessages, ErrorMessages } from "./validation/responseMessages";
import { configCors } from "./config/corsConfig";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";

import figlet from "figlet";

const app = express();
// Importing custom route and socket files
import authRoute from "./auth/routes/routes";
import adminRouter from "./admin/routes/routes";

// Configuring CORS with specific options for allowed origins and methods
app.use(configCors());

// Using body-parser middleware for parsing JSON and URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Using custom API routes under the /api/v1 base path
app.use("/api/v1/user", authRoute);
app.use("/api/v1/admin", adminRouter);

// Handling a GET request to the root URL
app.get("/", (req: Request, res: Response) => {
  figlet.text(
    SuccessMessages.SampelResponse,
    {
      font: "Ghost",
    },
    function (err: any, data: any) {
      if (err) {
        console.log(ErrorMessages.SomethingWentWrong);
      }
      res.send(`<pre>${data}</pre>`);
    }
  );
});

export default app;
