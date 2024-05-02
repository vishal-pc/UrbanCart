import nodemailer from "nodemailer";
import { envConfig } from "../../config/envConfig";

export const transporter = nodemailer.createTransport({
  host: envConfig.Mail_Host,
  port: envConfig.Mail_Port,
  from: envConfig.Mail_From,
  secure: false, // true for 465, false for other ports
  auth: {
    user: envConfig.Mail_Username,
    pass: envConfig.Mail_Password,
  },
});
