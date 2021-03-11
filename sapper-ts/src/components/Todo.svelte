<script>
  import { cache, useMutation } from "../cache.js"
  import { gql } from "../graphql.js"

  export let todo
  $: completed = todo.completed

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: String!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `

  async function updateTodo() {
    console.log("todo:", todo)

    const [_, error] = await useMutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed,
        },
      },
      updateQuery: "getAllTodos",
    })

    if (error) {
      console.error(error)
    }
  }
</script>

<li id={todo.id}>
  <label for="todo_{todo.id}">
    <input
      on:change={updateTodo}
      id="todo_{todo.id}"
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
