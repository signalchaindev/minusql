<script>
  import { onMount } from "svelte"
  import { client, gql } from "../graphql.js"
  import { ErrorStore } from "../stores/store_Errors.js"

  onMount(() => {
    queryError()
  })

  const HANDLE_ERRORS_QUERY = gql`
    query HANDLE_ERRORS_QUERY {
      queryError
    }
  `

  async function queryError() {
    const [data, error] = await client.query(HANDLE_ERRORS_QUERY)
    if (error) {
      ErrorStore.set(error)
      return
    }

    console.log(data)
  }
</script>
