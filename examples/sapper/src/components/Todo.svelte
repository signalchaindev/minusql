<script>
  import { client, gql } from '../graphql.js'
  import { GET_ALL_TODOS_QUERY } from './getAllTodos.js'

  export let todo
  $: completed = todo.completed

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `

  async function updateTodo() {
    completed = !completed

    const { data, error } = await client.mutation({
      mutation: UPDATE_TODO_MUTATION,
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed,
        },
      },
      refetchQuery: GET_ALL_TODOS_QUERY,
    })

    if (error) {
      console.error(error)
    }

    console.log(data.updateTodo)
  }
</script>

<li id={todo.id}>
  <label for="todo_{todo.id}">
    <input
      id="todo_{todo.id}"
      on:change={updateTodo}
      type="checkbox"
      checked={completed}
    />
    <span>{todo.todo}</span>
  </label>
  &nbsp
  <a href={`todo/${todo.id}`} rel="prefetch">notes</a>
</li>

<style>
  li {
    display: flex;
    align-items: center;
    line-height: 0px;
  }

  li + li {
    margin-top: 8px;
  }

  label {
    display: block;
  }

  input {
    margin: 0px;
  }

  span {
    margin-left: 8px;
  }

  a {
    color: inherit;
  }
</style>
