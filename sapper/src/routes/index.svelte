<script context="module">
  import { client, gql } from "../graphql.js"

  const CMS_QUERY = gql`
    query CMS_QUERY {
      homePage {
        title
      }
    }
  `

  export async function preload() {
    const [data, error] = await client.query(CMS_QUERY)
    if (error) {
      return {
        title: data?.homePage?.title || null,
        error: null,
      }
    }

    return {
      title: data?.homePage?.title,
      error: null,
    }
  }
</script>

<script>
  import InputForm from "../components/InputForm.svelte"
  import TodoList from "../components/TodoList.svelte"
  import { ErrorStore } from "../stores/store_Errors.js"

  export let title
  export let error

  if (error) {
    ErrorStore.set(error)
  }
</script>

<section>
  <h1>{title}</h1>
  <InputForm />
  <TodoList />
</section>

<style>
  h1 {
    text-align: center;
  }
</style>
