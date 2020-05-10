import generateId from './generateId.js'

const todos = new Map()

const seed = [
  {
    id: generateId(),
    todo: 'Learn some GraphQL',
    completed: false,
  },
  {
    id: generateId(),
    todo: 'Launch awesome app!',
    completed: false,
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
