import fetch from './utils/isoFetch.js'
// import generateCacheKey from './utils/generate-cache-key.js'
// import gqlParser from './utils/gql-string-parser.js'
// import safeJsonParse from './utils/safe-json-parse.js'

type RequestMethod = 'POST'

interface RequestHeaders {
  Accept: 'application/json'
  'Content-Type': 'application/json'
  [index: string]: any
}

type RequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin'
type RequestCredentials = 'include' | 'omit' | 'same-origin'
type RequestCache =
  | 'default'
  | 'force-cache'
  | 'no-cache'
  | 'no-store'
  | 'only-if-cached'
  | 'reload'

// https://github.com/apollographql/apollo-client/issues/207#issuecomment-260639943
interface RequestObject {
  method: RequestMethod
  headers: RequestHeaders
  body: string
  mode: RequestMode
  credentials: RequestCredentials
  cache: RequestCache
  [key: string]: any
}

interface MinusQLInput {
  uri: string
  credentials?: string
  headers?: RequestHeaders
  requestOptions?: Object
}

type MinusQLReturn = [Object | null, Error | null]

/**
 * The cache
 */
// const cacheStore = new Map()

/**
 * Create a MinusQL instance
 */
export function MinusQL(
  this: MinusQLInput,
  { uri, credentials, headers, requestOptions }: MinusQLInput,
): void {
  this.uri = uri
  this.headers = headers
  this.requestOptions = requestOptions
  this.credentials = credentials
}

/**
 * Query method
 */
interface QueryInput {
  query: string // gql query string
  variables: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  [key: string]: any
}

MinusQL.prototype.query = async function query({
  query,
  variables,
  headers,
  requestOptions,
  ...rest
}: QueryInput): Promise<MinusQLReturn> {
  try {
    return this.aggregateResolvers(
      'query',
      {
        operation: query,
        variables,
        headers,
        requestOptions,
      },
      rest,
    )
  } catch (err) {
    return [null, { name: '#236754348', message: err }]
  }
}

/**
 * Mutation method
 */
interface MutationInput {
  mutation: string // gql query string
  variables: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  [key: string]: any
}

MinusQL.prototype.mutation = async function mutation({
  mutation,
  variables,
  headers,
  requestOptions,
  // refetchQuery,
  // updateItem,
  // deleteItem,
  ...rest
}: MutationInput): Promise<MinusQLReturn> {
  try {
    return this.aggregateResolvers(
      'mutation',
      {
        operation: mutation,
        variables,
        headers,
        requestOptions,
      },
      rest,
    )
  } catch (err) {
    return [null, { name: '#434823675', message: err }]
  }
}

/**
 * Aggregate Resolvers method
 */
interface AggregateResolveOptions {
  operation: string
  variables
  headers
  requestOptions
}

MinusQL.prototype.aggregateResolvers = async function aggregateResolvers(
  operationType: string,
  options: AggregateResolveOptions,
  rest: { [key: string]: string } = {},
): Promise<MinusQLReturn> {
  try {
    if (options && !options.operation) {
      return [
        null,
        {
          name: '#736592202',
          message: `${operationType} method requires a '${operationType}' operation as a GQL string`,
        },
      ]
    }
    if (Object.keys(rest).length !== 0) {
      return [
        null,
        {
          name: '#3425822457',
          message: `${Object.keys(rest)[0]} is not a valid option`,
        },
      ]
    }

    if (options && options.headers) {
      this.headers = { ...this.headers, headers: options.headers }
    }
    if (options && options.requestOptions) {
      this.requestOptions = {
        ...this.requestOptions,
        requestOptions: options.requestOptions,
      }
    }

    const [data, error] = await this.fetchHandler({
      operation: options.operation,
      variables: options.variables,
    })
    if (error !== null) {
      return [null, error]
    }
    return [data, null]
  } catch (err) {
    return [null, { name: '#7538289028', message: err }]
  }
}

/**
 * Fetch handler
 */
interface FetchHandlerInput {
  operation: string // gql query string
  variables: Object // resolver variables
  // refetchQuery?: Object
  // updateItem?: Object
  // deleteItem?: Object
}

MinusQL.prototype.fetchHandler = async function fetchHandler({
  operation,
  variables,
}: // refetchQuery,
// updateItem,
// deleteItem,
FetchHandlerInput): Promise<MinusQLReturn> {
  try {
    // // TODO: Write better parser
    // const [operationType, operationName] = gqlParser(operation)

    // const isQuery = operationType === 'query'
    // const isMutation = operationType === 'mutation'

    // const initializeCacheItemData = {
    //   operation,
    //   operationName,
    //   operationType,
    //   variables,
    //   refetchQuery,
    //   requestOptions,
    //   isQuery,
    //   isMutation,
    //   data: null,
    //   updateItem,
    //   deleteItem,
    // }

    // // If there is data in the cache, return that data
    // const cacheData = await this.preFetchHandler(initializeCacheItemData)
    // if (cacheData) {
    //   return {
    //     ...cacheData,
    //     error: null,
    //   }
    // }

    const requestObject: RequestObject = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify({
        query: operation,
        variables,
      }),
      credentials: this.credentials || 'include',
      ...this.requestOptions,
    }

    console.log("-----------I'M FETCHING!-----------")
    interface ResJson {
      errors?: Object
      data: Object | null
    }
    const res = await fetch(this.uri, requestObject)
    const resJson: ResJson = await res.json()
    if (resJson && resJson.errors) {
      return [
        null,
        {
          name: resJson.errors[0].extensions.code,
          message: resJson.errors[0].message,
        },
      ]
    }

    // // Set data in cache
    // if (isQuery) {
    //   await this.cache({data})
    // }

    return [resJson.data, null]
  } catch (err) {
    return [null, { name: '#78464281', message: err }]
  }
}

// /**
//  * Cache handler method
//  *
//  * @param {Object!} initializeCacheItemData
//  * @param {String} initializeCacheItemData.operation
//  * @param {String} initializeCacheItemData.operationName
//  * @param {String} initializeCacheItemData.operationType
//  * @param {Object || String} initializeCacheItemData.variables
//  * @param {Object} initializeCacheItemData.refetchQuery
//  * @param {Object} initializeCacheItemData.requestOptions
//  * @param {Boolean} initializeCacheItemData.isQuery
//  * @param {Boolean} initializeCacheItemData.isMutation
//  * @param {Object} initializeCacheItemData.data
//  * @param {} initializeCacheItemData.updateItem
//  * @param {} initializeCacheItemData.deleteItem
//  */
// MinusQL.prototype.cache = async function cache(initializeCacheItemData) {
//   const {
//     operation,
//     operationName,
//     variables,
//     refetchQuery,
//     requestOptions,
//     data,
//     updateItem,
//     deleteItem,
//   } = initializeCacheItemData

//   const cacheKey = generateCacheKey({
//     operation,
//     operationName,
//     variables,
//     refetchQuery,
//     updateItem,
//     deleteItem,
//   })

//   // Client side cache works as expected
//   // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

//   const keyIsCached = cacheStore.has(cacheKey)

//   const options = {
//     operation,
//     variables,
//     requestOptions,
//   }

//   if (!keyIsCached && !refetchQuery && data) {
//     cacheStore.set(cacheKey, { ...data, options })
//     console.log('\nSET CACHE:', cacheStore, '\n')
//     return
//   }

//   if (keyIsCached && cacheKey && !refetchQuery && !updateItem && !deleteItem) {
//     const value = cacheStore.get(cacheKey)
//     console.log('\nGET CACHED ITEM:', cacheStore, '\n')
//     return value
//   }

//   // if (refetchQuery) {
//   //   // const refetchKey = JSON.stringify(refetchQuery)
//   //   // console.log('refetchKey:', refetchKey)
//   //   // cacheStore.delete(cacheKey)

//   //   // // Get the informations off the cache value to refetch the query
//   //   this.fetchHandler(options)
//   //   console.log('\nREFETCH QUERY:', cacheStore, '\n')

//   //   const cs = cacheStore.get(cacheKey)
//   //   console.log('cs:', cs)
//   // }

//   // if (updateItem) {
//   //   const { data, ...keyData } = updateItem
//   //   const updateKey = JSON.stringify(keyData)
//   //   const currentVal = cacheStore.get(updateKey)
//   //   const options = currentVal && currentVal.options

//   //   cacheStore.set(updateKey, { data, options })

//   //   console.log('\nUPDATE CACHE:', cacheStore, '\n')
//   //   return cacheStore
//   // }

//   // if (deleteItem) {
//   //   const key = JSON.stringify(deleteItem)
//   //   const has = cacheStore.has(key)

//   //   if (has) {
//   //     cacheStore.delete(key)
//   //   }

//   //   console.log('\nUPDATE CACHE:', cacheStore, '\n')
//   //   return cacheStore
//   // }
// }

// /**
//  * Pre-Fetch handler method - Handles caching policies
//  *
//  * @private
//  * @param {Object!} initializeCacheItemData
//  * @param {String} initializeCacheItemData.operation
//  * @param {String} initializeCacheItemData.operationName
//  * @param {String} initializeCacheItemData.operationType
//  * @param {Object || String} initializeCacheItemData.variables
//  * @param {Object} initializeCacheItemData.refetchQuery
//  * @param {Object} initializeCacheItemData.requestOptions
//  * @param {Boolean} initializeCacheItemData.isQuery
//  * @param {Boolean} initializeCacheItemData.isMutation
//  * @param {Object} initializeCacheItemData.data
//  * @param {} initializeCacheItemData.updateItem
//  * @param {} initializeCacheItemData.deleteItem
//  */
// MinusQL.prototype.preFetchHandler = async function preFetchHandler(
//   initializeCacheItemData,
// ) {
//   const { isMutation, refetchQuery } = initializeCacheItemData

//   let cacheData
//   const cacheKey = generateCacheKey(initializeCacheItemData)
//   const keyIsCached = cacheStore.has(cacheKey)

//   // If there is data in the cache, get it
//   if (keyIsCached) {
//     cacheData = cacheStore.get(cacheKey)
//   }

//   if (isMutation && refetchQuery) {
//     cacheData = await this.cache(initializeCacheItemData)
//   }

//   // If there is data in the cache, return it
//   if (cacheData) {
//     return cacheData
//   }
// }
