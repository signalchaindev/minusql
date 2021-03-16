import { User } from "../model.js"

export async function getCurrentUser(_, { id }) {
  return User.findOne({ _id: id }).catch(console.error)
}
