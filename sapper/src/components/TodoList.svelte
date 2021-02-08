<script>
  import { onMount } from "svelte";
  import Todo from "../components/Todo.svelte";
  import Loading from "../components/Loading.svelte";
  import { GET_ALL_TODOS_QUERY } from "./getAllTodos.js";
  import { client } from "../graphql.js";

  let loading = true;
  let todos = [];
  $: todos = todos;

  onMount(() => {
    fetchTodos();
  });

  async function fetchTodos() {
    const [data, error] = await client.query({
      query: GET_ALL_TODOS_QUERY,
    });
    if (error !== null) {
      console.error(error.name);
      console.error(error.message);
      return;
    }

    todos = data && data.getAllTodos;
    loading = false;
  }
</script>

{#if loading}
  <Loading />
{:else}
  <ul>
    {#each todos as todo}
      <Todo {todo} />
    {/each}
  </ul>
{/if}

<style>
  ul {
    margin-top: 24px;
  }
</style>
