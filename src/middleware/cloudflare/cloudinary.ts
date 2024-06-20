import { v2 as cloudinary } from "cloudinary";
import { envConfig } from "../../config/envConfig";

cloudinary.config({
  cloud_name: envConfig.Cloudnary_Cloud_Name,
  api_key: envConfig.Cloudnary_Api_Key,
  api_secret: envConfig.Cloudnary_Secret_key,
});

export default cloudinary;
