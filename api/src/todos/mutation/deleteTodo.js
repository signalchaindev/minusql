import todos from "../../../database/todos.js"

export function deleteTodo(_, args) {
  const { id } = args

  todos.delete(id)

  return "Todo has been deleted"
}
