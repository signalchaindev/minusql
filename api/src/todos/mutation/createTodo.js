import todos from '../../../database/todos.js'
import generateId from '../../../database/utils/generateId.js'

export function createTodo(_, args) {
  const { todo, completed } = args.input

  const id = generateId()

  const newTodo = {
    id,
    todo,
    completed,
    notes: '',
  }

  todos.set(id, newTodo)

  return newTodo
}
