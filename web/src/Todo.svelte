<script>
  import { client, gql } from './graphql.js'

  export let todo

  async function updateTodo() {
    const UPDATE_TODO_MUTATION = gql`
      mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
        updateTodo(id: $id, todo: $todo)
      }
    `

    const { updateTodo, error } = await client.mutation({
      mutation: UPDATE_TODO_MUTATION,
      variables: {
        id: todo.id,
        todo: {
          completed: true,
        },
      },
      refetchQuery: {
        query: 'GET_ALL_TODOS_QUERY',
      },
    })

    if (error) {
      console.error(error)
    }

    console.log('updateTodo:', updateTodo)
  }
</script>

<li id={todo.id}>
  <label for="todo_{todo.id}">
    <input
      id="todo_{todo.id}"
      on:change={updateTodo}
      type="checkbox"
      checked={todo.completed}
    />
    <span>{todo.todo}</span>
  </label>
</li>

<style>
  li {
    display: flex;
    align-items: center;
    line-height: 0px;
  }

  /* li + li {
    margin-top: 8px;
  } */

  label {
    display: block;
  }

  input {
    margin: 0px;
  }

  span {
    margin-left: 8px;
  }
</style>
