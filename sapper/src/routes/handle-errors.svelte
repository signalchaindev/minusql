<script>
  import { onMount } from "svelte"
  import { useQuery } from "../cache.js"
  import { gql } from "../graphql.js"
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
