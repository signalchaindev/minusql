<script>
  import { onMount } from "svelte"
  import Todo from "./Todo.svelte"
  import Loading from "./Loading.svelte"
  import { useQuery } from "@signalchain/svelte-minusql"
  import { GET_ALL_TODOS_QUERY } from "../graphql/query.js"

  let data
  let loading = true

  onMount(async () => {
    const [d, error] = await useQuery(GET_ALL_TODOS_QUERY)
    if (error) {
      console.error("Error:", error)
    }

    data = d
    loading = false
  })
</script>

{#if loading}
  <Loading />
{:else if $data?.getAllTodos?.length > 0}
  <ul>
    {#each $data.getAllTodos as todo (todo._id)}
      <Todo {todo} />
    {/each}
  </ul>
{:else}
  <p>No todos found</p>
{/if}

<style>
  ul {
    margin: 24px auto;
    max-width: max-content;
  }
</style>
