import todos from "../../../database/todos.js"

export function getTodoById(_, { id }) {
  const todo = todos.get(id)
  return todo
}
