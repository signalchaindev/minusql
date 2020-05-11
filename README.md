# MinusQl (working title)

[WIP]

Pronounced "minuscule".

A 3.4kb GraphQL client.

Ships with:

1. A GraphQL template tag package

1. Cache

1. SSR friendly

## Initialize Client

```js
// graphql.js

import { MinusQL, gql } from './minusql'

const endpoint = 'http://localhost:<port>/<graphql_path>'

const client = new MinusQL({ uri: endpoint })

export { client, gql }
```

### Client Options

TODO: Test requestOptions

| Option         | Type    | Description                                |
| -------------- | ------- | ------------------------------------------ |
| uri            | string  | the server address of the GraphQL endpoint |
| headers        | object  | request headers                            |
| requestOptions | object  | default options to fetch request*          |
| verbose        | boolean | log errors to console                      |

\* The requestOptions option can be set on the global client object or overridden on a a per query basis (refer to fetch api)

#### Default Client Options

| Option Headers       | Type   | Description      |
| -------------------- | ------ | ---------------- |
| method               | string | POST             |
| headers.Accept       | string | application/json |
| headers.Content-Type | string | application/json |
| credentials          | string | include          |

## Client API methods

| Method   | Type     | Param Type                | Description                                  |
| -------- | -------- | ------------------------- | -------------------------------------------- |
| query    | function | object (query options)    | Used to query GraphQL server                 |
| mutation | function | object (mutation options) | Used to send GrahpQL mutations to the server |

### Query Method

```js
 const GET_ALL_TODOS_QUERY = gql`
  query GET_ALL_TODOS_QUERY {s
    getAllTodos {
      id
      todo
      completed
    }
  }
`

const { getAllTodos, error } = await client.query({
  query: GET_ALL_TODOS_QUERY,
})
```

#### Query Options

TODO: Test requestOptions

| Method         | Type   | required | Description                                     |
| -------------- | ------ | -------- | ----------------------------------------------- |
| query          | string | true     | gql query string                                |
| variables      | object | false    | query variables                                 |
| requestOptions | object | false    | additional request options (refer to fetch api) |

| Returns        | type   | Description                                                    |
| -------------- | ------ | -------------------------------------------------------------- |
| Query Response | object | query response object*                                         |
| *.<query_name> | object | contains all query data where the name of the query is the key |
| *.error        | object | errors object                                                  |

\* The query response object is dynamically sized based on the number of queries that are sent by the fetch.

### Mutation Method

```js
const CREATE_TODO_MUTATION = gql`
  mutation CREATE_TODO_MUTATION($input: TodoInput!) {
    createTodo(input: $input) {
      id
      todo
      completed
    }
  }
`
const { createTodo, error } = await client.mutation({
  mutation: CREATE_TODO_MUTATION,
  variables: {
    input: {
      todo: value,
      completed: false,
    },
  },
})
```

#### Mutation Options

TODO: Test requestOptions
TODO: Finish refetchQuery functionality

| Method         | Type   | required | Description                                              |
| -------------- | ------ | -------- | -------------------------------------------------------- |
| mutation       | string | true     | gql mutation string                                      |
| variables      | object | false    | mutation variables                                       |
| requestOptions | object | false    | additional request options (refer to fetch api)          |
| refetchQuery   | string | false    | name of query whose data you wish to update in the cache |

| Returns           | type   | Description                                                          |
| ----------------- | ------ | -------------------------------------------------------------------- |
| Query Response    | object | mutation response object*                                            |
| *.<mutation_name> | object | contains all mutation data where the name of the mutation is the key |
| *.error           | object | errors object                                                        |

\* The mutation response object is dynamically sized based on the number of queries that are sent by the fetch.
