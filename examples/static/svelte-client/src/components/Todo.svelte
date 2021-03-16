<script>
  import { client, gql } from "../graphql.js"

  export let todo

  async function updateTodo() {
    const UPDATE_TODO_MUTATION = gql`
      mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
        updateTodo(id: $id, todo: $todo)
      }
    `

    const [updateTodo, error] = await client.mutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo._id,
        todo: {
          completed: true,
        },
      },
      refetchQuery: {
        query: "GET_ALL_TODOS_QUERY",
      },
    })

    if (error) {
      console.error(error)
    }

    console.log("updateTodo:", updateTodo)
  }
</script>

<li id={todo._id}>
  <label for="todo_{todo._id}">
    <input
      id="todo_{todo._id}"
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
    margin-bottom: 8px;
  }

  li:last-of-type {
    margin-bottom: 0px;
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
</style>
