import { MinusQL, gql } from "minusql"

const endpoint = `${process.env.GQL_SERVER_ENDPOINT_BASE}/${process.env.GQL_SERVER_PATH}`

const client = new MinusQL({ uri: endpoint })

export { client, gql }
