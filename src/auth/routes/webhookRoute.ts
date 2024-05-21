import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

import { envConfig } from "../../config/envConfig";
import { updatePaymentIntent } from "../controllers/paymentController";

const endpointSecret = envConfig.Stripe_Web_Hook_Secret_Key;
const secreteKey = envConfig.Stripe_Secret_key;
const stripe = new Stripe(secreteKey);

const webhookRoute = express.Router();
// Web hook route
webhookRoute.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return false;
    }
    let session: any = "";
    const payload = req.body;
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );

      switch (event?.type) {
        case "customer.created":
          session = event.data.object;
          break;
        case "charge.succeeded":
          session = event.data.object;
          break;
        case "charge.failed":
          session = event.data.object;
          break;
        case "checkout.session.completed":
          session = event.data.object;
          let paymentData = event.data.object;
          if (paymentData.payment_status === "paid") {
            await updatePaymentIntent(paymentData);
          }
          break;
        case "checkout.session.expired":
          session = event.data.object;
          break;
        case "payment_intent.succeeded":
          session = event.data.object;

          break;
        case "payment_intent.created":
          session = event.data.object;
          break;
        case "charge.updated":
          session = event.data.object;
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.send();
    } catch (err: any) {
      console.error("Error processing Stripe webhook:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default webhookRoute;
