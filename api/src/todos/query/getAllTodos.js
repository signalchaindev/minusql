import { Todo } from "../model" // .ts

export async function getAllTodos() {
  return Todo.find().catch(console.error())
}
