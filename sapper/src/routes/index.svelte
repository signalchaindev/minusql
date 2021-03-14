<script context="module">
  import { gql } from "minusql"
  import { useQuery } from "svelte-minusql"

  const CMS_QUERY = gql`
    query CMS_QUERY {
      homePage {
        title
      }
    }
  `

  export async function preload() {
    const [data, error] = await useQuery(CMS_QUERY)
    return {
      title: data?.homePage?.title || null,
      error: error || null,
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
