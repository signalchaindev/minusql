<script>
  import { onMount } from "svelte";
  import { client, gql } from "../graphql.js";
  import { GET_ALL_TODOS_QUERY } from "./getAllTodos.js";

  export let id;

  let editMode = false;
  let todo;
  $: todo = todo;

  onMount(async () => {
    const GET_TODO_BY_ID = gql`
      query GET_TODO_BY_ID($id: ID!) {
        getTodoById(id: $id) {
          id
          todo
          completed
          notes
        }
      }
    `;
    const { data, error } = await client.query(GET_TODO_BY_ID, {
      variables: { id },
    });

    if (error) {
      console.error(error);
    }

    todo = data && data.getTodoById;
  });

  const UPDATE_TODO_MUTATION = gql`
    mutation UPDATE_TODO_MUTATION($id: ID!, $todo: TodoInput!) {
      updateTodo(id: $id, todo: $todo)
    }
  `;

  async function updateTodo() {
    editMode = false;

    const [data, error] = await client.mutation(UPDATE_TODO_MUTATION, {
      variables: {
        id: todo.id,
        todo: {
          todo: todo.todo,
          completed: todo.completed,
          notes: todo.notes,
        },
      },
      refetchQuery: { query: GET_ALL_TODOS_QUERY },
    });

    if (error) {
      console.error(error);
    }

    console.log(data && data.updateTodo);
  }
</script>

{#if todo}
  <h1>{todo.todo}</h1>
  <button class="edit-btn" on:click={() => (editMode = !editMode)}>edit</button>

  {#if editMode}
    <p>
      Completed:
      <input type="checkbox" bind:checked={todo.completed} />
    </p>
  {:else}
    <p>Completed: {todo.completed}</p>
  {/if}

  {#if editMode}
    <p>
      notes:
      <input type="text" bind:value={todo.notes} />
    </p>
    <button on:click={updateTodo}>Save</button>
  {:else}
    <p>Notes: {todo.notes}</p>
  {/if}
{/if}

{#if !todo}
  <h1>Not found</h1>
{/if}

<style>
  button {
    font-size: 16px;
    padding: 6px 8px;
  }

  .edit-btn {
    margin-bottom: 24px;
  }
</style>
