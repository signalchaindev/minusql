<script>
  import { onMount } from "svelte"
  import { gql } from "@signalchain/minusql"
  import { useQuery } from "@signalchain/svelte-minusql"
  import { ErrorStore } from "../stores/store_Errors.js"

  const HANDLE_ERRORS_QUERY = gql`
    query HANDLE_ERRORS_QUERY {
      queryError
    }
  `

  onMount(async () => {
    const [data, error] = await useQuery(HANDLE_ERRORS_QUERY)
    if (error) {
      ErrorStore.set(error)
      return
    }

    console.log(data)
  })
</script>

<h1>This page is to test errors</h1>
