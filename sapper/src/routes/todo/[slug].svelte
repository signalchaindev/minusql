<script context="module">
  export async function preload({ params }) {
    return {
      todoId: params.slug,
    }
  }
</script>

<script>
  import { onMount } from "svelte"
  import { client, gql } from "../../graphql.js"
  import { ErrorStore } from "../../stores/store_Errors.js"

  export let todoId

  let loading = true
  let editMode = false
  let todo

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
    const [data, error] = await client.query(GET_TODO_BY_ID, {
      variables: { id: todoId },
    })
    if (error) {
      ErrorStore.set(error)
    }

    todo = data?.getTodoById
    loading = false
  })

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `

  async function updateTodo() {
    editMode = false

    const [data, error] = await client.mutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed: todo.completed,
          notes: todo.notes,
        },
      },
      // updateQuery: "getAllTodos",
    })

    if (error) {
      console.error(error)
    }

    console.log(data && data.updateTodo)
  }
</script>

<section>
  {#if loading}
    <p>Loading...</p>
  {:else if todo}
    <div class="ct-heading">
      <h1>Todo: {todo.todo}</h1>
      <button class="edit-btn" on:click={() => (editMode = !editMode)}>
        edit
      </button>
    </div>

    <div class="ct-details">
      {#if editMode}
        <p>
          Completed:
          <input type="checkbox" bind:checked={todo.completed} />
        </p>
      {:else}
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
      {/if}

      {#if editMode}
        <p>
          notes:
          <input type="text" bind:value={todo.notes} />
        </p>
        <button class="save-btn" on:click={updateTodo}>Save</button>
      {:else}
        <p>Notes: {todo.notes}</p>
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
  }

  button {
    font-size: 16px;
    margin-left: 16px;
    padding: 6px 8px;
    line-height: 1;
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
