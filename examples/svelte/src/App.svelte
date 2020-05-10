<script>
  import { onMount } from 'svelte'
  import Todo from './Todo.svelte'
  import Loading from './Loading.svelte'
  import { client, gql } from './graphql.js'

  let value = ''
  let todos
  $: todos = todos

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
    const { getAllTodos, error } = await client.query({
      query: GET_ALL_TODOS_QUERY,
    })

    if (error) {
      console.error('error:', error)
    }

    // setTimeout(() => {
    todos = getAllTodos
    // }, 5000)
  })

  async function createTodo(e) {
    e.preventDefault()

    const CREATE_TODO_MUTATION = gql`
      mutation CREATE_TODO_MUTATION($input: TodoInput!) {
        createTodo(input: $input) {
          id
          todo
          completed
        }
      }
    `
    const { createTodo, error } = await client.mutation({
      mutation: CREATE_TODO_MUTATION,
      variables: {
        input: {
          todo: value,
          completed: false,
        },
      },
    })

    if (error) {
      console.error('error:', error)
    }

    value = ''
    console.log('createTodo:', createTodo)
  }
</script>

<main>
  <h1>My Todos</h1>

  <form on:submit={createTodo}>
    <label for="todo-input">
      <span>Add todo:</span>
      <input
        id="todo-input"
        type="text"
        on:keydown={e => (value = e.target.value)}
        {value}
      />
    </label>
  </form>

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
  form {
    max-width: 500px;
    margin: 0 auto;
  }

  label {
    display: block;
    text-align: center;
  }

  label > span {
    font-size: 24px;
    font-weight: bold;
  }

  label > input {
    margin: 8px auto 0;
    width: 100%;
  }
</style>
