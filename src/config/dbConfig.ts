import mongoose from "mongoose";
import { envConfig } from "../config/envConfig";

const db = `mongodb+srv://${envConfig.Mongo_DB_Name}:${envConfig.Mongo_DB_Pass}@chat.rylxpqx.mongodb.net/test?retryWrites=true&w=majority&appName=Chat`;

mongoose
  .connect(db)
  .then(() => console.log("Database Connected...👍️"))
  .catch((err) => console.error("Database not connected...🥱", err));
