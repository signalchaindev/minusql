<script context="module">
  import { gql } from "../graphql.js"
  import { cache, useQuery } from "../cache.js"

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

  // $: console.log("cache:", $cache)

  export let nav
  export let error
  export let segment
  if (segment) {
    // noop
  }

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
  <section>
    <p>{$cache?.testConnection || "Loading..."}</p>
  </section>

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

  section {
    padding: 16px;
  }

  p {
    text-align: center;
    padding-top: 7px;
  }
</style>
