import todos from "../../../database/todos.js"
import { getTodoById } from "../query/getTodoById.js"

export function updateTodo(_, { todo }) {
  const currTodo = getTodoById(_, { id: todo.id })
  const updatedTodo = {
    ...currTodo,
    ...todo,
  }

  todos.set(todo.id, updatedTodo)

  return updatedTodo
}
