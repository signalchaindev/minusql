<script context="module">
  export async function preload({ params }) {
    return {
      todoId: params.slug,
    }
  }
</script>

<script>
  import { onMount } from "svelte"
  import { cache, useQuery, useMutation } from "../../cache.js"
  import { gql } from "../../graphql.js"
  import { ErrorStore } from "../../stores/store_Errors.js"

  export let todoId

  let loading = true
  let editMode = false
  $: todo = $cache?.getTodoById

  const GET_TODO_BY_ID = gql`
    query GET_TODO_BY_ID($id: String!) {
      getTodoById(id: $id) {
        id
        todo
        completed
        notes
      }
    }
  `

  onMount(async () => {
    const [_, error] = await useQuery(GET_TODO_BY_ID, {
      variables: { id: todoId },
    })
    if (error) {
      ErrorStore.set(error)
    }

    window.addEventListener("keydown", handleKeyPress)
    loading = false

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      loading = true
    }
  })

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: String!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `

  async function updateTodo() {
    editMode = false

    const [_, error] = await useMutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed: todo.completed,
          notes: todo.notes,
        },
      },
      updateQuery: "getAllTodos",
    })

    if (error) {
      console.error(error)
    }
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
    <div class="ct-heading">
      {#if !editMode}
        <h1>
          {todo.todo}
        </h1>
      {:else}
        <h1>
          <input type="text" bind:value={todo.todo} />
        </h1>
      {/if}

      <button class="edit-btn" on:click={() => (editMode = !editMode)}>
        edit
      </button>
    </div>

    <div class="ct-details">
      {#if !editMode}
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
      {:else}
        <p>
          Completed:
          <input type="checkbox" bind:checked={todo.completed} />
        </p>
      {/if}

      {#if !editMode}
        <p>Notes: {todo.notes}</p>
      {:else}
        <p>
          Notes:
          <input type="text" bind:value={todo.notes} />
        </p>
        <button class="save-btn" on:click={updateTodo}>Save</button>
      {/if}
    </div>
  {:else}
    <h1>Not found</h1>
  {/if}
</section>

<style>
  .ct-heading {
    display: flex;
    justify-content: center;
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

  .save-btn {
    display: block;
    margin: 16px 0 0 auto;
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
