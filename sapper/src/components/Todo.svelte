<script>
  import { gql } from "minusql"
  import { cache, useMutation } from "svelte-minusql"

  export let todo
  $: completed = todo.completed

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($todo: TodoInput!) {
      updateTodo(todo: $todo) {
        id
        todo
        completed
      }
    }
  `

  async function updateTodo() {
    const [_, error] = await useMutation(UPDATE_TODO_MUTATION, {
      variables: {
        todo: {
          id: todo.id,
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
