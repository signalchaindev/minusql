import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

export const User = mongoose.models.user || mongoose.model("user", UserSchema)
