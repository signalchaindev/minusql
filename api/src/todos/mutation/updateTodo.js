import { Todo } from "../model" // .ts

export async function updateTodo(_, { todo }) {
  return Todo.findByIdAndUpdate({ _id: todo.id }, todo).catch(console.error())
}
