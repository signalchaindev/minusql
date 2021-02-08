import generateId from './utils/generateId.js'

const todos = new Map()

const seed = [
  {
    id: generateId(),
    todo: 'Learn some GraphQL',
    completed: false,
    description: '',
  },
  {
    id: generateId(),
    todo: 'Launch awesome app!',
    completed: false,
    description: '',
  },
]

function seedTodos() {
  for (const todo of seed) {
    todos.set(todo.id, todo)
  }
  return todos
}
seedTodos()

export default todos
