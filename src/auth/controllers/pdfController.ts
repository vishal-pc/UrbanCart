import { Response, Request } from "express";
import axios from "axios";
import puppeteer from "puppeteer";
import moment from "moment-timezone";
import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import { envConfig } from "../../config/envConfig";
import { downloadPdf } from "../../template/invoicePdf";
import Invoice from "../models/invoiceModel";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import cloudinary from "../../middleware/cloudflare/cloudinary";
import { generateRandomNumber } from "../../helpers/randomNumber";

// Find for existing random numbers
const generateUniqueOrderNumber = async () => {
  let invoiceNumber;
  let existingPayment;

  do {
    invoiceNumber = generateRandomNumber();
    existingPayment = await Invoice.findOne({ invoiceNumber });
  } while (existingPayment);

  return invoiceNumber;
};

// Download invoice in pdf
export const downloadPdfInvoice = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.status(StatusCodes.ClientError.NotFound).json({
        message: ErrorMessages.UserNotFound,
        success: false,
      });
    }
    const userId = user.userId;
    const paymentId = req.params.paymentId;
    const token = req.headers.authorization;

    const axiosConfig = {
      headers: {
        Authorization: token,
      },
    };
    const fetchPaymentDetails = await axios.get(
      `${envConfig.Get_Payment_By_ID}/${paymentId}`,
      axiosConfig
    );
    const paymentData = fetchPaymentDetails.data.payment;

    if (paymentData) {
      const {
        buyerUserDetails,
        totalCartAmount,
        totalProduct,
        orderNumber,
        createdAt,
        addressDetails,
      } = paymentData;
      const formattedDateAndTime =
        moment(createdAt).format("DD-MM-YYYY h:mm A");
      const dateTimeFormat = formattedDateAndTime.split(" ");
      const date = dateTimeFormat[0];
      const time = dateTimeFormat[1];
      const dayTime = dateTimeFormat[2];

      const invoiceNumber = await generateUniqueOrderNumber();

      let productRowsHTML = "";
      for (const product of totalProduct) {
        productRowsHTML += `
          <tr>
            <td>${product.productName}</td>
            <td>${product.productQuantity}</td>
            <td>₹ ${product.productPrice}</td>
            <td>₹ ${product.itemPrice}</td>
          </tr>
        `;
      }
      let pdfdata = await downloadPdf(
        buyerUserDetails.fullName,
        totalCartAmount,
        invoiceNumber,
        date,
        time,
        dayTime,
        productRowsHTML,
        orderNumber,
        addressDetails[0].mobileNumber,
        addressDetails[0].streetAddress,
        addressDetails[0].nearByAddress,
        addressDetails[0].cityName,
        addressDetails[0].stateName,
        addressDetails[0].areaPincode,
        addressDetails[0].country
      );

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(pdfdata);

      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        printBackground: true,
      });
      await browser.close();

      const uploadResult = await cloudinary.uploader.upload_stream(
        { resource_type: "image", format: "pdf" },
        (error: any, result: any) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res
              .status(StatusCodes.ServerError.InternalServerError)
              .json({
                message: ErrorMessages.SomethingWentWrong,
                success: false,
              });
          }

          const newInvoice = new Invoice({
            buyerUserId: userId,
            paymentId: paymentId,
            productId: totalProduct.map((product: any) => product._id),
            pdfUrl: result.secure_url,
            invoiceNumber: invoiceNumber,
            orderNumber: orderNumber,
            totalCartAmount: totalCartAmount,
          });

          newInvoice.save();

          res.status(StatusCodes.Success.Created).json({
            message: SuccessMessages.PdfInfo,
            success: true,
            pdfUrl: result.secure_url,
          });
        }
      );

      // Convert buffer to readable stream and pipe to cloudinary upload
      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);
      bufferStream.pipe(uploadResult);
    } else {
      return res.status(StatusCodes.ServerError.InternalServerError).json({
        message: ErrorMessages.SomethingWentWrong,
        success: false,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(StatusCodes.ServerError.InternalServerError).json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
    });
  }
};
