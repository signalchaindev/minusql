<script>
  import { gql } from "@signalchain/minusql"
  import { useMutation } from "@signalchain/svelte-minusql"
  import { GET_ALL_TODOS_QUERY, GET_TODO_BY_ID } from "../graphql/query.js"
  import { ErrorStore } from "../stores/store_Errors.js"
  import { SuccessStore } from "../stores/store_Success.js"

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
      ErrorStore.set(error)
    }
  }

  const DELETE_TODO_MUTATION = gql`
    mutation DELETE_TODO_MUTATION($id: String!) {
      deleteTodo(id: $id)
    }
  `

  async function deleteTodo(id) {
    const [data, error] = await useMutation(DELETE_TODO_MUTATION, {
      variables: {
        id,
      },
      deleteCacheKey: [
        {
          query: GET_TODO_BY_ID,
          variables: { id: todo._id },
        },
      ],
      refetchQuery: [{ query: GET_ALL_TODOS_QUERY }],
    })
    if (error) {
      ErrorStore.set(error)
    }
    SuccessStore.set({ alert: data.deleteTodo })
  }
</script>

<li id={todo._id}>
  <label for="todo_{todo._id}" class="checkbox-label">
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
  <button on:click={() => deleteTodo(todo._id)} class="primary">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="ionicon"
      viewBox="0 0 512 512"
    >
      <path
        d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
        fill="none"
        stroke="currentColor"
        stroke-miterlimit="10"
        stroke-width="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
        d="M320 320L192 192m0 128l128-128"
      />
    </svg>
  </button>
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

  a {
    color: inherit;
    margin-right: 36px;
  }

  button {
    border: none;
    border-radius: 100%;
    height: 24px;
    width: 24px;
    margin-left: auto;
    outline: none;
    transition: scale 500ms ease-in-out;
  }
  button:hover,
  button:focus {
    box-shadow: 0 0 0 2px red;
  }
  button:active {
    transform: scale(1.1);
  }
</style>
