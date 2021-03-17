<script context="module">
  export async function preload({ params }) {
    return {
      todoId: params.slug,
    }
  }
</script>

<script>
  import { goto } from "@sapper/app"
  import { onMount } from "svelte"
  import { gql } from "@signalchain/minusql"
  import { useQuery, useMutation } from "@signalchain/svelte-minusql"
  import { SuccessStore } from "../../stores/store_Success.js"
  import { ErrorStore } from "../../stores/store_Errors.js"
  import { GET_ALL_TODOS_QUERY, GET_TODO_BY_ID } from "../../graphql/query.js"

  export let todoId

  let data
  let loading = true
  let editMode = false
  $: todo = $data?.getTodoById

  onMount(async () => {
    const [d, error] = await useQuery(GET_TODO_BY_ID, {
      variables: { id: todoId },
    })
    if (error) {
      ErrorStore.set(error)
    }
    data = d

    window.addEventListener("keydown", handleKeyPress)
    loading = false

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      loading = true
    }
  })

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($todo: TodoInput!) {
      updateTodo(todo: $todo) {
        _id
        todo
        completed
        notes
      }
    }
  `

  async function updateTodo() {
    editMode = false

    const [_, error] = await useMutation(UPDATE_TODO_MUTATION, {
      variables: {
        todo: {
          id: todoId,
          todo: todo.todo,
          completed: todo.completed,
          notes: todo.notes,
        },
      },
      refetchQuery: [{ query: GET_ALL_TODOS_QUERY }],
    })
    if (error) {
      console.error(error)
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
      console.error(error)
    }
    SuccessStore.set({ alert: data.deleteTodo })
    goto("/")
  }

  function handleKeyPress(e) {
    if (editMode === true && e.key === "Enter") {
      updateTodo()
    }
  }
</script>

<section>
  {#if loading}
    <p>Loading...</p>
  {:else if todo}
    {#if !editMode}
      <div class="ct-heading">
        <h1>
          {todo.todo}
        </h1>
        <button class="edit-btn" on:click={() => (editMode = !editMode)}>
          edit
        </button>
      </div>

      <div class="ct-details">
        <p>
          Completed:
          <span
            style={todo.completed
              ? "color: var(--green400)"
              : "color: var(--red400)"}
          >
            {todo.completed}
          </span>
        </p>

        <p>Notes: {todo.notes}</p>
      </div>
    {:else}
      <div class="ct-heading">
        <h1 class="hide">
          {todo.todo}
        </h1>
        <input type="text" bind:value={todo.todo} />
      </div>

      <div class="ct-details">
        <p>
          Completed:
          <input type="checkbox" bind:checked={todo.completed} />
        </p>

        <p>
          Notes:
          <input type="text" bind:value={todo.notes} />
        </p>

        <div class="ct-action-buttons">
          <button class="save-btn" on:click={updateTodo}>Save</button>

          <button
            on:click={() => deleteTodo(todo._id)}
            class="primary delete-button"
          >
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
            <span>Delete</span>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <h1>Not found</h1>
  {/if}
</section>

<style>
  section {
    max-width: 500px;
    margin: 0 auto;
    padding-left: 24px;
    padding-right: 24px;
  }

  .ct-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    margin: 0;
    line-height: 0;
  }

  input {
    line-height: 0;
  }

  button {
    font-size: 16px;
    margin-left: 16px;
    padding: 6px 8px;
    line-height: 0;
  }

  button:hover,
  button:focus {
    box-shadow: 0 0 0 2px lightgreen;
  }

  .ct-action-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 16px;
  }

  .delete-button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 24px;
  }

  .delete-button:hover,
  .delete-button:focus {
    box-shadow: 0 0 0 2px red;
  }

  .delete-button svg {
    height: 24px;
    width: 24px;
  }

  .ct-details {
    margin-top: 24px;
  }

  p {
    font-size: 24px;
  }

  p + p {
    margin-top: 16px;
  }
</style>
