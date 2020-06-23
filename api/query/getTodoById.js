import todos from '../database/todos.js'

export default function getTodoById(_, args) {
  const { id } = args
  let todo = todos.get(id)

  return todo
}
