<script lang="ts">
  import { onMount } from "svelte"
  import { client, gql } from "../graphql.js"
  import Nav from "../components/Nav.svelte"

  export let segment: string

  const TEST_QUERY = gql`
    query TEST_QUERY {
      testConnection
    }
  `

  onMount(async () => {
    const [data, error] = await client.query(TEST_QUERY)
    console.log("data:", data)
    console.log("error:", error)
  })
</script>

<Nav {segment} />

<main>
  <slot />
</main>

<style>
  main {
    position: relative;
    max-width: 56em;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
