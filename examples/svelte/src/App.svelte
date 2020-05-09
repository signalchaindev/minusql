<script>
  import { onMount } from 'svelte'
  import { client, gql } from './graphql.js'

  let queryData
  $: queryData = queryData
  let mutationData
  $: mutationData = mutationData

  const HELLO_QUERY = gql`
    query HELLO_QUERY {
      hello
      t: test
      nameThing: products {
        name
        ...ThingField
      }

      exampleThing: products {
        example
        ...ThingField
      }
    }

    fragment ThingField on Product {
      thing
    }
  `

  const HOLA_MUTATION = gql`
    mutation HOLA_MUTATION($greeting: String) {
      hola(greeting: $greeting)
    }
  `

  onMount(() => {
    async function query() {
      const { t, hello, nameThing, exampleThing, error } = await client.query({
        query: HELLO_QUERY,
      })

      if (error) {
        console.error('error:', error)
      }

      queryData = { t, hello, nameThing, exampleThing }
    }
    query()

    async function mutation() {
      const { hola, error } = await client.mutation({
        mutation: HOLA_MUTATION,
        variables: { greeting: 'Hello' },
      })

      if (error) {
        console.error('error:', error)
      }

      mutationData = hola
    }
    mutation()
  })
</script>

<main>
  <h1>{queryData && queryData.hello}</h1>
  <h1>{queryData && queryData.t}</h1>
  <h1>{mutationData && mutationData}</h1>

  <pre>{JSON.stringify(queryData && queryData.nameThing, null, 2)}</pre>
  <pre>{JSON.stringify(queryData && queryData.exampleThing, null, 2)}</pre>
</main>
