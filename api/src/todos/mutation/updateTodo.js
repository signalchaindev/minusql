import todos from "../../../database/todos.js"
import { getTodoById } from "../query/getTodoById.js"

export function updateTodo(_, { id, todo }) {
  const currTodo = getTodoById(_, { id })
  const updatedTodo = {
    ...currTodo,
    ...todo,
  }

  todos.set(id, updatedTodo)

  return "Successfully updated todo"
}
