import { MinusQL, gql } from "minusql";

const endpoint = "http://localhost:3001/__playground";

const client = new MinusQL({ uri: endpoint });

export { client, gql };
