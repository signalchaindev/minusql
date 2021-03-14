<script context="module">
  import { gql } from "minusql"
  import { useQuery } from "../cache.js"

  const CMS_QUERY = gql`
    query CMS_QUERY {
      nav {
        link
        text
      }
    }
  `

  export async function preload() {
    const [data, error] = await useQuery(CMS_QUERY)
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
  import { onMount } from "svelte"
  import Nav from "../components/Nav.svelte"
  import ErrorToast from "../components/lib/Toast_Error.svelte"
  import { ErrorStore } from "../stores/store_Errors.js"
  import { cache } from "../cache.js"

  // $: console.log("cache:", $cache)

  export let nav
  export let error

  if (error) {
    ErrorStore.set(error)
  }

  const TEST_CONNECTION_QUERY = gql`
    query TEST_CONNECTION_QUERY {
      testConnection
    }
  `

  onMount(async () => {
    const [_, err] = await useQuery(TEST_CONNECTION_QUERY)
    if (error) {
      ErrorStore.set(err)
    }
  })
</script>

<Nav {nav} />

<main>
  <slot />
</main>

<ErrorToast />

<style>
  main {
    color: #000031;
    font-family: sans-serif;
    margin: 0 auto;
    max-width: max-content;
  }
</style>
