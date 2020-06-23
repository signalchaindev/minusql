<script>
  import { onMount } from 'svelte'
  import Todo from '../components/Todo.svelte'
  import Loading from '../components/Loading.svelte'
  import { client, gql } from '../graphql.js'

  $: todos = todos

  onMount(async () => {
    const GET_ALL_TODOS_QUERY = gql`
      query GET_ALL_TODOS_QUERY {
        getAllTodos {
          id
          todo
          completed
        }
      }
    `

    const { getAllTodos, error } = await client.query({
      query: GET_ALL_TODOS_QUERY,
    })

    if (error) {
      console.error(error)
    }

    todos = getAllTodos
  })
</script>

{#if todos}
  <ul>
    {#each todos as todo}
      <Todo {todo} />
    {/each}
  </ul>
{:else}
  <Loading />
{/if}

<style>
  ul {
    margin-top: 24px;
  }
</style>
