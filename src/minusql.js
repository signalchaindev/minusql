import aggregateOptions from './utils/aggregate-options.js'
// TODO: fix SSR
import fetch from './utils/iso-fetch.js'
import generateCacheKey from './utils/generate-cache-key.js'
import gqlParser from './utils/gql-string-parser.js'
import safeJsonParse from './utils/safe-json-parse.js'
import validateResolver from './utils/validate-resolver.js'

/**
 * The cache
 */
const cacheStore = new Map()

/**
 * Create a MinusQL instance
 *
 * @param {Object!} options
 * @param {String!} options.uri - the server address of the GraphQL endpoint
 * @param {Object} options.headers - request headers
 * @param {Object} options.requestOptions - addition options to fetch request (refer to fetch api)
 * @param {Boolean} options.verbose - log errors to console
 *
 * @return {Object} GraphQL client
 */
function MinusQL({ uri, credentials, headers, requestOptions, verbose }) {
  this.uri = uri

  this.requestObject = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: credentials || 'include',
    ...requestOptions,
  }

  if (verbose) {
    this.verbose = verbose
  }
}

/**
 * Query method
 *
 * @param {Object!} options
 * @param {String!} options.query - gql query string
 * @param {Object} options.variables - query variables
 * @param {Object} options.requestOptions - additional options to fetch request (refer to fetch api)
 *
 * @return {Object} *
 * @return {Object} *.<query_name> - contains all query data where the name of the query is the key
 * @return {Object} *.error
 */
MinusQL.prototype.query = function query({
  query,
  variables,
  requestOptions,
  ...rest
}) {
  const hasOperation = !!query
  validateResolver('query', hasOperation, rest)
  // If there is no operation, validateResolver handles throwing the error
  // Then we bail because we need the operation to successfully run this function
  if (!hasOperation) return

  const options = aggregateOptions({
    operation: query,
    variables,
    requestOptions,
  })

  return this.fetchHandler(options)
    .then(res => {
      return res
    })
    .catch(err => {
      console.error(err)
    })
}

/**
 * Mutation method
 *
 * @param {Object!} options
 * @param {String!} options.mutation - gql mutation string
 * @param {Object} options.variables - mutation variables
 * @param {Object} options.requestOptions - addition options to fetch request (refer to fetch api)
 * @param {String} options.refetchQuery - name of query whose data you wish to update in the cache
 * @param {TBD} options.updateItem
 * @param {TBD} options.deleteItem
 *
 * @return {Object} *
 * @return {Object} *.<mutation_name> - contains all query data where the name of the query is the key
 * @return {Object} *.error
 */
MinusQL.prototype.mutation = function mutation({
  mutation,
  variables,
  requestOptions,
  refetchQuery,
  updateItem,
  deleteItem,
  ...rest
}) {
  const hasOperation = !!mutation
  validateResolver('mutation', hasOperation, rest)
  // If there is no operation, validateResolver handles throwing the error
  // Then we bail because we need the operation to successfully run this function
  if (!hasOperation) return

  const options = aggregateOptions({
    operation: mutation,
    variables,
    requestOptions,
    refetchQuery,
    updateItem,
    deleteItem,
  })

  return this.fetchHandler(options)
    .then(res => {
      return res
    })
    .catch(err => {
      console.error(err)
    })
}

/**
 * Fetch handler
 *
 * @private
 *
 * @param {Object!} options
 * @param {String!} options.operation - gql query string
 * @param {Object} options.variables - resolver variables
 * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
 * @param {String} options.refetchQuery (mutation only) - name of query whose data you wish to update in the cache
 * @param {TBD} options.updateItem (mutation only)
 * @param {TBD} options.deleteItem (mutation only)
 *
 * @return {Object} *
 * @return {Object} *.<resolver_name>
 * @return {Object} *.error
 */
MinusQL.prototype.fetchHandler = async function fetchHandler({
  operation,
  variables,
  requestOptions,
  refetchQuery,
  updateItem,
  deleteItem,
}) {
  // TODO: Write better parser
  const [operationType, operationName] = gqlParser(operation)

  const isQuery = operationType === 'query'
  const isMutation = operationType === 'mutation'

  const initializeCacheItemData = {
    operation,
    operationName,
    operationType,
    variables,
    refetchQuery,
    requestOptions,
    isQuery,
    isMutation,
    data: null,
    updateItem,
    deleteItem,
  }

  // If there is data in the cache, return that data
  const cacheData = await this.preFetchHandler(initializeCacheItemData)
  if (cacheData) {
    return {
      ...cacheData,
      error: null,
    }
  }

  const options = {
    ...this.requestObject,
    ...requestOptions,
    body: JSON.stringify({
      query: operation,
      variables,
    }),
  }

  console.log("-----------I'M FETCHING!-----------")
  const res = await fetch(this.uri, options)
  const data = await res.json()
  initializeCacheItemData.data = data

  /**
   * message {String}
   * stack {Object}
   * details {Array}
   */
  let resErrors = {}
  resErrors = {
    message: res.statusText,
    stack: res,
    details: data && data.errors,
  }

  // if the response doesn't return anything
  const allDataKeyEmpty = Object.keys(data).every(key => !data[key])
  if (allDataKeyEmpty) {
    resErrors.details = [
      ...resErrors.details,
      { message: `No Response: ${data || null}` },
    ]
  }

  // If the Request fails, return errors and stop execution
  if (!res.ok || (data && data.errors && data.errors.length !== 0)) {
    const clientErrors = {}
    this.verbose && console.error('Error:', resErrors)

    for (const err of data.errors) {
      const [result] = safeJsonParse(err.message)

      if (typeof result === 'string') {
        if (result === '[object Object]') {
          throw Error('Error messages must be of type string')
        }

        clientErrors.message = result
      } else {
        for (const [key, val] of Object.entries(result)) {
          this.verbose && console.error(`Error: "${key}: ${val}"`)

          clientErrors[key] = val
        }
      }
    }

    return {
      data: null,
      error: Object.keys(clientErrors).length > 0 ? clientErrors : null,
    }
  }

  // Set data in cache
  if (isQuery) {
    await this.cache(initializeCacheItemData)
  }

  return { ...data, error: res.ok && null }
}

/**
 * Cache handler method
 *
 * @param {Object!} initializeCacheItemData
 * @param {String} initializeCacheItemData.operation
 * @param {String} initializeCacheItemData.operationName
 * @param {String} initializeCacheItemData.operationType
 * @param {Object || String} initializeCacheItemData.variables
 * @param {String} initializeCacheItemData.refetchQuery
 * @param {Object} initializeCacheItemData.requestOptions
 * @param {Boolean} initializeCacheItemData.isQuery
 * @param {Boolean} initializeCacheItemData.isMutation
 * @param {Object} initializeCacheItemData.data
 * @param {} initializeCacheItemData.updateItem
 * @param {} initializeCacheItemData.deleteItem
 */
MinusQL.prototype.cache = async function cache(initializeCacheItemData) {
  const {
    operation,
    operationName,
    operationType,
    variables,
    refetchQuery,
    requestOptions,
    isQuery,
    isMutation,
    data,
    updateItem,
    deleteItem,
  } = initializeCacheItemData

  let cacheKey = generateCacheKey({
    operation,
    operationName,
    variables,
    refetchQuery,
    updateItem,
    deleteItem,
  })

  // Client side cache works as expected
  // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

  const keyIsCached = cacheStore.has(cacheKey)

  const options = {
    operation,
    variables,
    requestOptions,
  }

  if (!keyIsCached && !refetchQuery && data) {
    cacheStore.set(cacheKey, { ...data, options })
    console.log('\nSET CACHE:', cacheStore, '\n')
    return
  }

  if (keyIsCached && cacheKey && !refetchQuery && !updateItem && !deleteItem) {
    const value = cacheStore.get(cacheKey)
    console.log('\nGET CACHED ITEM:', cacheStore, '\n')
    return value
  }

  if (refetchQuery) {
    const refetchKey = JSON.stringify(refetchQuery)
    cacheStore.delete(refetchKey)

    // Get the informations off the cache value to refetch the query
    this.fetchHandler(options)
    console.log('\nREFETCH QUERY:', cacheStore, '\n')

    const cs = cacheStore.get(refetchKey)
    console.log('cs:', cs)
  }

  // if (updateItem) {
  //   const { data, ...keyData } = updateItem
  //   const updateKey = JSON.stringify(keyData)
  //   const currentVal = cacheStore.get(updateKey)
  //   const options = currentVal && currentVal.options

  //   cacheStore.set(updateKey, { data, options })

  //   console.log('\nUPDATE CACHE:', cacheStore, '\n')
  //   return cacheStore
  // }

  // if (deleteItem) {
  //   const key = JSON.stringify(deleteItem)
  //   const has = cacheStore.has(key)

  //   if (has) {
  //     cacheStore.delete(key)
  //   }

  //   console.log('\nUPDATE CACHE:', cacheStore, '\n')
  //   return cacheStore
  // }
}

/**
 * Pre-Fetch handler method - Handles caching policies
 *
 * @private
 * @param {Object!} initializeCacheItemData
 * @param {String} initializeCacheItemData.operation
 * @param {String} initializeCacheItemData.operationName
 * @param {String} initializeCacheItemData.operationType
 * @param {Object || String} initializeCacheItemData.variables
 * @param {String} initializeCacheItemData.refetchQuery
 * @param {Object} initializeCacheItemData.requestOptions
 * @param {Boolean} initializeCacheItemData.isQuery
 * @param {Boolean} initializeCacheItemData.isMutation
 * @param {Object} initializeCacheItemData.data
 * @param {} initializeCacheItemData.updateItem
 * @param {} initializeCacheItemData.deleteItem
 */
MinusQL.prototype.preFetchHandler = async function preFetchHandler(initializeCacheItemData) {
  const { isMutation, refetchQuery } = initializeCacheItemData

  let cacheData
  let cacheKey = generateCacheKey(initializeCacheItemData)
  const keyIsCached = cacheStore.has(cacheKey)

  // If there is data in the cache, get it
  if (keyIsCached) {
    cacheData = cacheStore.get(cacheKey)
  }

  if (isMutation && refetchQuery) {
    cacheData = await this.cache(initializeCacheItemData)
  }

  // If there is data in the cache, return it
  if (cacheData) {
    return cacheData
  }
}

export default MinusQL
