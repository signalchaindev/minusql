<script>
  import { onMount } from "svelte"
  import Nav from "../components/Nav.svelte"
  import { gql } from "../graphql.js"
  import { cache, useQuery } from "../cache.js"

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
    const [_, error] = await useQuery(TEST_CONNECTION_QUERY)
    if (error) {
      console.error("Error:", error)
    }
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
