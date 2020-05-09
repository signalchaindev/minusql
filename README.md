# MinusQl

[WIP]

Pronounced "minuscule". A less than 2kb (probably) graphql client.

1. Cache

1. SSR and client friendly

## API

```js
// graphql.js

import { MinusQL, gql } from './minusql'

const endpoint = 'http://localhost:<port>/<graphql_path>'

const client = new MinusQL({ uri: endpoint })

export { client, gql }
```

### Options

 * @param {String!} options.uri - the server address of the GraphQL endpoint
 * @param {Object} options.headers - request headers
 * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
 * @param {Boolean} options.verbose - log errors to console
