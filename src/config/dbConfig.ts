import mongoose from "mongoose";
import { envConfig } from "../config/envConfig";

const db = `mongodb+srv://${envConfig.Mongo_DB_Name}:${envConfig.Mongo_DB_Pass}@cartapp.inzne6y.mongodb.net/?retryWrites=true&w=majority&appName=CartApp`;

const dbConnection = mongoose.connect(db);

export default dbConnection;
