import todos from '../cache/todos.js'
import generateId from '../cache/generateId.js'

export default function createTodo(_, args) {
  const { todo } = args

  const id = generateId()

  const newTodo = {
    id,
    todo,
  }

  todos.set(id, newTodo)

  return newTodo
}
