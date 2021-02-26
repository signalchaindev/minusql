<script>
  import { onMount } from "svelte"
  import { gql } from "../graphql.js"
  import Todo from "./Todo.svelte"
  import Loading from "./Loading.svelte"
  import { cache, useQuery } from "./cache.js"

  $: console.log("TL cache:", $cache)

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
    const [_, error] = await useQuery(GET_ALL_TODOS_QUERY)
    if (error) {
      console.log("Error:", error)
    }

    loading = false
  })
</script>

{#if loading}
  <Loading />
{:else}
  <ul>
    {#each $cache.getAllTodos as todo}
      <Todo {todo} />
    {/each}
  </ul>
{/if}

<style>
  ul {
    margin: 24px auto;
    max-width: max-content;
  }
</style>
