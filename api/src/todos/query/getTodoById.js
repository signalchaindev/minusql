import { Todo } from "../model" // .ts

export async function getTodoById(_, { id }) {
  return Todo.findById(id).catch(console.error())
}
