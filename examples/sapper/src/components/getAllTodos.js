import { gql } from '../graphql.js'

export const GET_ALL_TODOS_QUERY = gql`
  query GET_ALL_TODOS_QUERY {
    getAllTodos {
      id
      todo
      completed
    }
  }
`
