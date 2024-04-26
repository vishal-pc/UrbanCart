import cors from "cors";
import bodyParser from "body-parser";
import { envConfig } from "./config/envConfig";
import express from "express";
import "../src/config/dbConfig";
import figlet from "figlet";

const app = express();
// Importing custom route and socket files
import authRoute from "./user/routes/routes";
import adminRouter from "./admin/routes/routes";

const Port = envConfig.Port;

// Using body-parser middleware for parsing JSON and URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuring CORS with specific options for allowed origins and methods
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

// Using custom API routes under the /api/v1 base path
app.use("/api/v1/user", authRoute);
app.use("/api/v1/admin", adminRouter);

// Handling a GET request to the root URL
app.get("/", () => {
  const body = figlet.textSync("Hello From Node!");
  return new Response(body);
});

// Starting the server and listening on the specified port
app.listen(Port, () => {
  console.log(`Server is running... 🚀`);
  const error = false;
  if (error) {
    console.log("Server is not running...😴");
  }
});

export default app;
