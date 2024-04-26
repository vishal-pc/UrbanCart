import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: {
    type: String,
  },
  productPrice: {
    type: Number,
  },
  productImg: {
    type: String,
  },
  productDescription: {
    type: String,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
