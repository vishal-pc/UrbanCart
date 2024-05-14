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
  Mail_Host: string;
  Mail_Port: number;
  Mail_Username: string;
  Mail_Password: string;
  Mail_From: string;
  Reset_Password: string;
  Stripe_Secret_key: string;
  Stripe_Public_Key: string;
  Stripe_Web_Hook_Secret_Key: string;
  Success_Redirect: string;
  Cancel_Redirect: string;
  Get_Payment_By_ID: string;
}

export const envConfig: EnvConfig = {
  Port: process.env.Port ? parseInt(process.env.Port, 10) : 5000,
  Mongo_DB_Name: process.env.Mongo_DB_Name || "localhost",
  Mongo_DB_Pass: process.env.Mongo_DB_Pass || "localhost",
  Express_Secret: process.env.Express_Secret || "defaultSecret",
  Jwt_Secret: process.env.Jwt_Secret || "defaultSecret",
  Jwt_Expiry_Hours: process.env.Jwt_Expiry_Hours || "defaultSecret",
  Cloudnary_Cloud_Name: process.env.Cloudnary_Cloud_Name || "defaultSecret",
  Cloudnary_Api_Key: process.env.Cloudnary_Api_Key || "defaultSecret",
  Cloudnary_Secret_key: process.env.Cloudnary_Secret_key || "defaultSecret",
  Mail_Host: process.env.Mail_Host || "defaultSecret",
  Mail_Port: process.env.Mail_Port ? parseInt(process.env.Mail_Port, 10) : 565,
  Mail_Username: process.env.Mail_Username || "defaultSecret",
  Mail_Password: process.env.Mail_Password || "defaultSecret",
  Mail_From: process.env.Mail_From || "defaultSecret",
  Reset_Password: process.env.Reset_Password || "defaultSecret",
  Stripe_Secret_key: process.env.Stripe_Secret_key || "defaultSecret",
  Stripe_Public_Key: process.env.Stripe_Public_Key || "defaultSecret",
  Stripe_Web_Hook_Secret_Key:
    process.env.Stripe_Web_Hook_Secret_Key || "defaultSecret",
  Success_Redirect: process.env.Success_Redirect || "defaultSecret",
  Cancel_Redirect: process.env.Cancel_Redirect || "defaultSecret",
  Get_Payment_By_ID: process.env.Get_Payment_By_ID || "defaultSecret",
};
