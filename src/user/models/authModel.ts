import mongoose from "mongoose";
const { Schema } = mongoose;

const authSchema = new Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

const Auth = mongoose.model("Auth", authSchema);
export default Auth;
