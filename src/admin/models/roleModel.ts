import mongoose from "mongoose";

let roleSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    require: true,
  },
});

export const Role = mongoose.model("Role", roleSchema);
