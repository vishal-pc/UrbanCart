import mongoose from "mongoose";
import { envConfig } from "../config/envConfig";
import { SuccessMessages, ErrorMessages } from "../validation/responseMessages";

const db = `mongodb+srv://${envConfig.Mongo_DB_Name}:${envConfig.Mongo_DB_Pass}@cartapp.inzne6y.mongodb.net/?retryWrites=true&w=majority&appName=CartApp`;
mongoose
  .connect(db)
  .then(() => console.log(SuccessMessages.DataBaseRunning))
  .catch((err) => console.error(ErrorMessages.DatabaseError, err));
