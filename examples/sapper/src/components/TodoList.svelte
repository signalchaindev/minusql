<script>
  import { onMount } from 'svelte'
  import Todo from '../components/Todo.svelte'
  import Loading from '../components/Loading.svelte'
  import { GET_ALL_TODOS_QUERY } from './getAllTodos.js'
  import { client } from '../graphql.js'

  $: todos = todos

  onMount(async () => {
    const { data, error } = await client.query({
      query: GET_ALL_TODOS_QUERY,
    })

    if (error) {
      console.error(error)
    }

    todos = data.getAllTodos
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
