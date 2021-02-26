<script>
  import { onMount } from "svelte"
  import Nav from "../components/Nav.svelte"
  import { client, gql } from "../graphql.js"
  import { cache } from "../components/cache.js"

  $: console.log("LO cache:", $cache)

  export let segment
  if (segment) {
    // noop
  }

  const TEST_CONNECTION_QUERY = gql`
    query TEST_CONNECTION_QUERY {
      testConnection
    }
  `

  onMount(async () => {
    const [data, error] = await client.query(TEST_CONNECTION_QUERY)
    if (error) {
      console.log("Error:", error)
    }

    cache.set("testConnection", data?.testConnection)
  })
</script>

<Nav />

<main>
  <section>
    <p>{$cache.testConnection}</p>
  </section>

  <slot />
</main>

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
