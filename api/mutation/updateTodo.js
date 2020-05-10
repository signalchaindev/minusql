import todos from '../cache/todos.js'
import getTodoById from '../query/getTodoById.js'

export default function updateTodo(_, args) {
  const { id, todo } = args
  let updateTodo = getTodoById(_, { id })

  updateTodo = {
    ...updateTodo,
    ...todo,
  }

  todos.set(id, updateTodo)

  return 'Successfully updated todo'
}
