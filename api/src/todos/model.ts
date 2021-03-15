import mongoose from "mongoose"

const Schema = mongoose.Schema

const TodoSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    todo: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

export const Todo = mongoose.models.todo || mongoose.model("todo", TodoSchema)
