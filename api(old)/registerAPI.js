import createTodo from './mutation/createTodo.js'
import deleteTodo from './mutation/deleteTodo.js'
import updateTodo from './mutation/updateTodo.js'
import getAllTodos from './query/getAllTodos.js'
import getTodoById from './query/getTodoById.js'

const resolvers = {
  Mutation: {
    createTodo,
    deleteTodo,
    updateTodo,
  },
  Query: {
    getAllTodos,
    getTodoById,
  },
}

export default resolvers
