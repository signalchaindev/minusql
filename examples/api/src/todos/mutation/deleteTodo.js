import { Todo } from "../model" // .ts

export async function deleteTodo(_, { id }) {
  Todo.deleteOne({ _id: id }).catch(console.error())
  return "Todo has been deleted"
}
