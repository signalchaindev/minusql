import todos from '../../../database/todos.js'

export function getTodoById(_, args) {
  const { id } = args
  const todo = todos.get(id)

  return todo
}
