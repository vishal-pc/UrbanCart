import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import moment from "moment-timezone";
import { ErrorMessages, StatusCodes } from "../../validation/responseMessages";
import { envConfig } from "../../config/envConfig";
import { downloadPdf } from "../../template/pdf";

const generateInvoiceNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8;
  let invoiceNumber = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    invoiceNumber += characters.charAt(randomIndex);
  }
  return invoiceNumber;
};

export const downloadPdfInvoice = async (req: Request, res: Response) => {
  try {
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
      const { buyerUserDetails, totalCartAmount, totalProduct } = paymentData;
      const formattedDateAndTime = moment(paymentData.createdAt).format(
        "DD-MM-YYYY h:mm A"
      );
      const dateTimeFormat = formattedDateAndTime.split(" ");
      const date = dateTimeFormat[0];
      const time = dateTimeFormat[1];
      const dayTime = dateTimeFormat[2];

      const invoiceNumber = generateInvoiceNumber();

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
        productRowsHTML
      );
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setContent(pdfdata);

      const pdfOptions: any = {
        format: "A4",
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        printBackground: true,
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      const pdfPath = path.join(
        __dirname,
        `../../uploads/pdf/${invoiceNumber}.pdf`
      );
      await fs.promises.writeFile(pdfPath, pdfBuffer);

      await browser.close();
      res.sendFile(pdfPath);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
