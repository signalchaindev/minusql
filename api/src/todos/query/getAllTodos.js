import todos from '../../../database/todos.js'

export function getAllTodos() {
  const entries = []

  for (const [_, entry] of todos) {
    entries.push(entry)
  }

  return entries
}
