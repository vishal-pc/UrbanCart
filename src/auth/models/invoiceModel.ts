import mongoose, { Document, Schema } from "mongoose";

export interface IInvoice extends Document {
  buyerUserId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId[];
  pdfUrl: string;
  invoiceNumber: string;
  orderNumber: string;
  totalCartAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new mongoose.Schema(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    pdfUrl: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    orderNumber: {
      type: String,
    },
    totalCartAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);
const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;
