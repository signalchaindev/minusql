<script>
  import { gql } from "../graphql.js"
  import { useMutation } from "../cache.js"
  import { ErrorStore } from "../stores/store_Errors.js"

  let value = ""

  const CREATE_TODO_MUTATION = gql`
    mutation CREATE_TODO_MUTATION($todo: String!) {
      createTodo(todo: $todo) {
        id
        todo
        completed
      }
    }
  `

  async function createTodo() {
    const [_, error] = await useMutation(CREATE_TODO_MUTATION, {
      variables: {
        todo: value,
      },
      updateQuery: "getAllTodos",
    })
    if (error) {
      ErrorStore.set(error)
      return
    }

    value = ""
  }
</script>

<form on:submit|preventDefault={createTodo}>
  <label for="todo-input">
    <span>Add Todo:</span>
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
    margin: 24px auto;
    display: flex;
  }

  label {
    display: block;
  }

  label > span {
    font-size: 24px;
    font-weight: bold;
  }

  label > input {
    display: block;
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
