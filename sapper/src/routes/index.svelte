<script context="module">
  // import { client } from "../graphql.js"
  // import { GET_ALL_TODOS_QUERY } from "../components/getAllTodos.js"

  // export async function preload() {
  //   const [data, error] = await client.query(GET_ALL_TODOS_QUERY)
  //   if (error) {
  //     console.log("Error:", error)
  //     return
  //   }

  //   const todos = data && data.getAllTodos

  //   return { todos }
  // }
</script>

<script>
  import InputForm from "../components/InputForm.svelte"
  import TodoList from "../components/TodoList.svelte"

  // export let todos
</script>

<h1>My Todos</h1>
<InputForm />
<!-- <TodoList {todos} /> -->
<TodoList />
