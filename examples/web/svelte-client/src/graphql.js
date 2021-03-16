import { MinusQL, gql } from 'minusql'

const endpoint = 'http://localhost:3001/__playground'

// ENV is not setup for this example so verbose is hard coded to true for development
// const dev = process.env.NODE_ENV === 'development'
const dev = true

const client = new MinusQL({ uri: endpoint, verbose: dev })

export { client, gql }
