import { gql } from "@signalchain/minusql"

export const GET_ALL_TODOS_QUERY = gql`
  query GET_ALL_TODOS_QUERY {
    getAllTodos {
      _id
      todo
      completed
    }
  }
`

export const GET_TODO_BY_ID = gql`
  query GET_TODO_BY_ID($id: String!) {
    getTodoById(id: $id) {
      _id
      todo
      completed
      notes
    }
  }
`
