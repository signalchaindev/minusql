<script>
  import { client, gql } from "../graphql.js"
  // import { GET_ALL_TODOS_QUERY } from "./TodosStore.js"

  export let todo
  $: completed = todo.completed

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `

  async function updateTodo() {
    completed = !completed

    const [data, error] = await client.mutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed,
        },
      },
      // refetchQuery: { query: GET_ALL_TODOS_QUERY },
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
  <a href={`todo/${todo.id}`} sapper:prefetch>notes</a>
</li>

<style>
  li {
    display: flex;
    align-items: center;
    line-height: 0px;
    margin-bottom: 16px;
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

  a {
    color: inherit;
  }
</style>
