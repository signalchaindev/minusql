<script>
  import { gql } from "minusql"
  import { useMutation } from "svelte-minusql"
  import { GET_ALL_TODOS_QUERY, GET_TODO_BY_ID } from "../graphql/query.js"

  export let todo
  $: completed = todo.completed

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($todo: TodoInput!) {
      updateTodo(todo: $todo) {
        _id
        todo
        completed
      }
    }
  `

  async function updateTodo() {
    completed = !completed
    const [_, error] = await useMutation(UPDATE_TODO_MUTATION, {
      variables: {
        todo: {
          id: todo._id,
          todo: todo.todo,
          completed,
        },
      },
      refetchQuery: [
        { query: GET_TODO_BY_ID, variables: { id: todo._id } },
        { query: GET_ALL_TODOS_QUERY },
      ],
    })

    if (error) {
      console.error(error)
    }
  }
</script>

<li id={todo._id}>
  <label for="todo_{todo._id}">
    <input
      on:change={updateTodo}
      id="todo_{todo._id}"
      type="checkbox"
      checked={completed}
    />
    <span>{todo.todo}</span>
  </label>
  &nbsp
  <a href={`todo/${todo._id}`} sapper:prefetch>notes</a>
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
