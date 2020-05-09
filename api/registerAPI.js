import hola from './mutation.js'
import { hello, test, products } from './query.js'

const resolvers = {
  Mutation: { hola },
  Query: { hello, test, products },
}

export default resolvers
