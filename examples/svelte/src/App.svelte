<script>
  import { onMount } from 'svelte'
  import Todo from './Todo.svelte'
  import Loading from './Loading.svelte'
  import { client, gql } from './graphql.js'

  let value = ''
  $: console.log('value:', value)
  let todos
  $: todos = todos
  $: console.log('todos:', todos)

  const GET_ALL_TODOS_QUERY = gql`
    query GET_ALL_TODOS_QUERY {
      getAllTodos {
        id
        todo
        completed
      }
    }
  `

  // const HOLA_MUTATION = gql`
  //   mutation HOLA_MUTATION($greeting: String) {
  //     hola(greeting: $greeting)
  //   }
  // `

  onMount(async () => {
    const { getAllTodos, error } = await client.query({
      query: GET_ALL_TODOS_QUERY,
    })

    if (error) {
      console.error('error:', error)
    }

    // setTimeout(() => {
    todos = getAllTodos
    // }, 5000)

    //   const { hola, error } = await client.mutation({
    //     mutation: HOLA_MUTATION,
    //     variables: { greeting: 'Hello' },
    //   })

    //   if (error) {
    //     console.error('error:', error)
    //   }

    //   mutationData = hola
  })
</script>

<main>
  <h1>My Todos</h1>

  <label for="todo-input">
    <span />
    <input
      id="todo-input"
      type="text"
      on:keydown={e => (value = e.target.value)}
      {value}
    />
  </label>

  {#if todos}
    <ul>
      {#each todos as todo}
        <Todo {todo} />
      {/each}
    </ul>
  {:else}
    <Loading />
  {/if}

  <!-- {#await todos}
    {#each todos as todo}
      <Todo {todo} />
    {/each}
  {/await} -->
</main>

<style>
  label {
    display: block;
    text-align: center;
  }

  label > span {
    display: block;
    font-size: 24px;
    font-weight: bold;
  }

  label > input {
    display: block;
    margin: 8px auto 0;
    max-width: 500px;
    width: 100%;
  }
</style>
