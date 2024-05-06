import nodemailer from "nodemailer";
import { envConfig } from "../../config/envConfig";

export const transporter = nodemailer.createTransport({
  host: envConfig.Mail_Host,
  port: envConfig.Mail_Port,
  from: envConfig.Mail_From,
  secure: true, // true for port 465, false for port 565
  auth: {
    user: envConfig.Mail_Username,
    pass: envConfig.Mail_Password,
  },
});
