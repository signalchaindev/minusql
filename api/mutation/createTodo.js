import todos from '../cache/todos.js'
import generateId from '../cache/generateId.js'

export default function createTodo(_, args) {
  const { todo, completed } = args.input

  const id = generateId()

  const newTodo = {
    id,
    todo,
    completed,
  }

  todos.set(id, newTodo)

  return newTodo
}
