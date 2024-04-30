import * as dotenv from "dotenv";
dotenv.config();

export interface EnvConfig {
  Port: number;
  Mongo_DB_Name: string;
  Mongo_DB_Pass: string;
  Express_Secret: string;
  Jwt_Secret: string;
  Jwt_Expiry_Hours: string;
  Cloudnary_Cloud_Name: string;
  Cloudnary_Api_Key: string;
  Cloudnary_Secret_key: string;
}

export const envConfig: EnvConfig = {
  Port: process.env.Port ? parseInt(process.env.Port, 10) : 5000,
  Mongo_DB_Name: process.env.Mongo_DB_Name || "localhost",
  Mongo_DB_Pass: process.env.Mongo_DB_Pass || "localhost",
  Express_Secret: process.env.Express_Secret || "defaultSecret",
  Jwt_Secret: process.env.Jwt_Secret || "defaultSecret",
  Jwt_Expiry_Hours: process.env.Jwt_Expiry_Hours || "default",
  Cloudnary_Cloud_Name: process.env.Cloudnary_Cloud_Name || "defaultSecret",
  Cloudnary_Api_Key: process.env.Cloudnary_Api_Key || "defaultSecret",
  Cloudnary_Secret_key: process.env.Cloudnary_Secret_key || "defaultSecret",
};
