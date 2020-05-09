# MinusQl

[WIP]

Pronounced "minuscule".

A 3.4kb GraphQL client.

Ships with:

1. A GraphQL template tag package

1. Cache

1. SSR friendly

## API

```js
// graphql.js

import { MinusQL, gql } from './minusql'

const endpoint = 'http://localhost:<port>/<graphql_path>'

const client = new MinusQL({ uri: endpoint })

export { client, gql }
```

### Options

| Option         | Type    | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| uri            | string  | the server address of the GraphQL endpoint            |
| headers        | Object  | request headers                                       |
| requestOptions | Object  | addition options to fetch request(refer to fetch api) |
| verbose        | Boolean | log errors to console                                 |
