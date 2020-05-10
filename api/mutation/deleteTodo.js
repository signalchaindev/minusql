import todos from '../cache/todos.js'

export default function deleteTodo(_, args) {
  const { id } = args

  todos.delete(id)

  return 'Todo has been deleted'
}
