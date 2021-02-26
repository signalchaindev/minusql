import todos from "../../../database/todos.js"
import generateId from "../../../database/utils/generateId.js"

export function createTodo(_, { todo }) {
  const id = generateId()
  const newTodo = {
    id,
    todo,
    completed: false,
    notes: "",
  }

  todos.set(id, newTodo)

  return newTodo
}
