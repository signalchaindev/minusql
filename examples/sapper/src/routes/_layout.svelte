<script context="module">
  import { MinusQL, gql } from "@signalchain/minusql"
  import { setClient } from "@signalchain/svelte-minusql"

  const endpoint = `${process.env.GQL_SERVER_ENDPOINT_BASE}/${process.env.GQL_SERVER_PATH}`
  const client = new MinusQL({ uri: endpoint })
  setClient(client)

  const CMS_QUERY = gql`
    query CMS_QUERY {
      nav {
        link
        text
      }
    }
  `

  export async function preload() {
    const [data, error] = await client.query(CMS_QUERY)
    if (error) {
      return {
        nav: data?.nav || null,
        error: null,
      }
    }

    return {
      nav: data?.nav,
      error: null,
    }
  }
</script>

<script>
  import Nav from "../components/Nav.svelte"
  import SuccessToast from "../components/lib/Toast_Success.svelte"
  import ErrorToast from "../components/lib/Toast_Error.svelte"
  import { ErrorStore } from "../stores/store_Errors.js"

  export let nav
  export let error

  if (error) {
    ErrorStore.set(error)
  }
</script>

<Nav {nav} />

<main>
  <slot />
</main>

<SuccessToast />
<ErrorToast />
