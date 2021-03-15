<script>
  import { onMount } from "svelte"
  import { gql } from "minusql"
  import Todo from "./Todo.svelte"
  import Loading from "./Loading.svelte"
  import { useQuery } from "svelte-minusql"

  let data
  let loading = true

  const GET_ALL_TODOS_QUERY = gql`
    query GET_ALL_TODOS_QUERY {
      getAllTodos {
        id
        todo
        completed
      }
    }
  `

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
{:else if $data?.getAllTodos}
  <ul>
    {#each $data.getAllTodos as todo (todo.id)}
      <Todo {todo} />
    {/each}
  </ul>
{:else}
  <p>Unable to display todos</p>
{/if}

<style>
  ul {
    margin: 24px auto;
    max-width: max-content;
  }
</style>
