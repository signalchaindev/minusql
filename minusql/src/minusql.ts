// import isEmpty from './utils/isEmpty.js'
import fetch from './utils/isoFetch.js'
// import generateCacheKey from './utils/generate-cache-key.js'
import gqlParser from './utils/gql-string-parser.js'
// import safeJsonParse from './utils/safe-json-parse.js'
import validateResolver from './utils/validateResolver.js'

/**
 * The cache
 */
// const cacheStore = new Map()

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

interface QueryInput {
  query: string // gql query string
  variables: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  [key: string]: any
}

/**
 * Query method
 */
MinusQL.prototype.query = async function query({
  query,
  variables,
  headers,
  requestOptions,
  ...rest
}: QueryInput): Promise<MinusQLReturn> {
  try {
    const err = validateResolver('query', !!query, rest)
    if (err !== null) {
      return [null, err]
    }

    if (headers) {
      this.headers = { ...this.headers, headers }
    }
    if (requestOptions) {
      this.requestOptions = { ...this.requestOptions, requestOptions }
    }

    const [data, error] = await this.fetchHandler({
      operation: query,
      variables,
    })

    if (error !== null) {
      return [null, error]
    }
    if (data === null) {
      return [null, { name: '#34785642839', message: 'no data my friend' }]
    }

    return [data, null]
  } catch (err) {
    return [null, { name: '#236754348', message: err }]
  }
}

// /**
//  * Mutation method
//  *
//  * @param {Object!} options
//  * @param {String!} options.mutation - gql mutation string
//  * @param {Object} options.variables - mutation variables
//  * @param {Object} options.requestOptions - addition options to fetch request (refer to fetch api)
//  * @param {String} options.refetchQuery - name of query whose data you wish to update in the cache
//  * @param {TBD} options.updateItem
//  * @param {TBD} options.deleteItem
//  *
//  * @return {Object} *
//  * @return {Object} *.<mutation_name> - contains all query data where the name of the query is the key
//  * @return {Object} *.error
//  */
// MinusQL.prototype.mutation = function mutation({
//   mutation,
//   variables,
//   requestOptions,
//   refetchQuery,
//   updateItem,
//   deleteItem,
//   ...rest
// }) {
//   const hasOperation = !!mutation
//   validateResolver('mutation', hasOperation, rest)
//   // If there is no operation, validateResolver handles throwing the error
//   // Then we bail because we need the operation to successfully run this function
//   if (!hasOperation) return

//   const options = aggregateOptions({
//     operation: mutation,
//     variables,
//     requestOptions,
//     refetchQuery,
//     updateItem,
//     deleteItem,
//   })

//   return this.fetchHandler(options)
//     .then(res => {
//       return res
//     })
//     .catch(err => {
//       console.error(err)
//     })
// }

interface FetchHandlerInput {
  operation: string // gql query string
  variables: Object // resolver variables
  // refetchQuery?: Object
  // updateItem?: Object
  // deleteItem?: Object
}

/**
 * Fetch handler
 */
MinusQL.prototype.fetchHandler = async function fetchHandler({
  operation,
  variables,
  // refetchQuery,
  // updateItem,
  // deleteItem,
}): Promise<MinusQLReturn> {
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
