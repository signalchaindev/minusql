import { Todo } from "../model" // .ts

export function deleteTodo(_, args) {
  const { id } = args

  // todos.delete(id)

  return "Todo has been deleted"
}
