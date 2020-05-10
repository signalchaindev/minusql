const todos = new Map()

const seed = [
  {
    id: '123456',
    todo: 'Learn some GraphQL',
    completed: false,
  },
  {
    id: '654321',
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
