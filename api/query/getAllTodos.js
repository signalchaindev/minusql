import todos from '../cache/todos.js'

export default function products() {
  const entries = []

  for (const [_, entry] of todos) {
    entries.push(entry)
  }

  return entries
}
