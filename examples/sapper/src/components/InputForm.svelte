<script>
  import { client, gql } from '../graphql.js'
  import { GET_ALL_TODOS_QUERY } from './getAllTodos.js'

  let value
  $: value = ''

  const CREATE_TODO_MUTATION = gql`
    mutation CREATE_TODO_MUTATION($input: TodoInput!) {
      createTodo(input: $input) {
        id
        todo
        completed
      }
    }
  `

  async function createTodo() {
    const { error } = await client.mutation({
      mutation: CREATE_TODO_MUTATION,
      variables: {
        input: {
          todo: value,
          completed: false,
        },
      },
      refetchQuery: { query: GET_ALL_TODOS_QUERY },
    })

    if (error) {
      console.error('error:', error)
    }

    value = ''
  }
</script>

<form on:submit|preventDefault={createTodo}>
  <label for="todo-input">
    <span>Add todo:</span>
    <input
      id="todo-input"
      type="text"
      on:keyup={e => (value = e.target.value)}
      {value}
    />
  </label>
  <button type="submit">+</button>
</form>

<style>
  form {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
  }

  label {
    display: block;
    text-align: center;
  }

  label > span {
    font-size: 24px;
    font-weight: bold;
  }

  label > input {
    margin: 8px auto 0;
    max-width: 100%;
  }

  button {
    font-size: 24px;
    font-weight: bolder;
    height: 36px;
    align-self: flex-end;
  }
</style>
