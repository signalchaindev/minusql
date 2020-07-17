<script context="module">
  export async function preload({ params }) {
    return {
      id: params.slug,
    }
  }
</script>

<script>
  import { onMount } from 'svelte'
  import { client, gql } from '../../graphql.js'

  export let id

  let todo
  $: todo = todo

  onMount(async () => {
    const GET_TODO_BY_ID = gql`
      query GET_TODO_BY_ID($id: ID!) {
        getTodoById(id: $id) {
          id
          todo
          completed
        }
      }
    `
    const { data, error } = await client.query({
      query: GET_TODO_BY_ID,
      variables: { id },
    })

    if (error) {
      console.error(error)
    }

    todo = data && data.getTodoById
  })
</script>

{#if todo}
  <h1>{todo.todo}</h1>
{:else}
  <h1>Not found</h1>
{/if}
