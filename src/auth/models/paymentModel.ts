import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  _id: any;
  buyerUserId: Schema.Types.ObjectId;
  totalProduct: Array<{
    _id: any;
    productId: Schema.Types.ObjectId;
    productName: string;
    productPrice: number;
    productQuantity: number;
    productDescription: string;
    itemPrice: number;
    cartId: string;
    productImageUrl: string;
  }>;
  stripeUserId: string;
  totalCartAmount: number;
  paymentStatus: "Pending" | "Completed" | "Canceled";
  orderNumber: string;
  stripePayment: string;
  userAddress: Array<{
    _id: any;
    addressId: Schema.Types.ObjectId;
    mobileNumber: number;
    country: string;
    stateId: number;
    stateName: string;
    cityId: number;
    cityName: string;
    streetAddress: string;
    nearByAddress: string;
    areaPincode: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    totalProduct: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        productName: {
          type: String,
        },
        productPrice: {
          type: Number,
        },
        productQuantity: {
          type: Number,
        },
        productDescription: {
          type: String,
        },
        itemPrice: {
          type: Number,
        },
        cartId: {
          type: String,
        },
        productImageUrl: {
          type: String,
        },
      },
    ],
    totalCartAmount: {
      type: Number,
    },
    stripeUserId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Canceled"],
      default: "Pending",
    },
    orderNumber: {
      type: String,
    },
    stripePayment: {
      type: Schema.Types.Mixed,
    },
    userAddress: [
      {
        addressId: {
          type: Schema.Types.ObjectId,
          ref: "Address",
          required: false,
        },
        mobileNumber: { type: Number },
        country: { type: String },
        stateId: { type: Number },
        stateName: { type: String },
        cityId: { type: Number },
        cityName: { type: String },
        streetAddress: { type: String },
        nearByAddress: { type: String },
        areaPincode: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
