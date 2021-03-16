import { Todo } from "../model" // .ts

export async function createTodo(_, { todo }) {
  return Todo.create({
    todo,
    completed: false,
    notes: "",
  }).catch(console.error)
}
