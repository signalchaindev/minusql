import aggregateOptions from './utils/aggregate-options.js'
// TODO: fix SSR
// import fetch from './utils/iso-fetch.js'
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
 * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
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
  const [operationType, name] = operation && operation.split(' ')
  const [operationName] = name && name.split('(')

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

  return { ...data.data, error: res.ok && null }
}

function generateCacheKey({
  operation,
  operationName,
  variables,
  refetchQuery,
  updateItem,
  deleteItem,
}) {
  if (operation && !updateItem && !deleteItem) {
    return JSON.stringify({
      query: refetchQuery ? refetchQuery.query : operationName,
      variables: refetchQuery ? refetchQuery.variables : variables,
    })
  }
}

/**
 * Cache handler method
 *
 * @param {Object!} options
 * @param {String} options.refetchQuery
 * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
 * TODO: write types
 */
MinusQL.prototype.cache = async function cache({
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
}) {
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
    // USAGE: Sign out user is a bad example. That's more of an update or delete cache key situation, but this is the syntax.

    // await client.mutation({
    //   mutation: SIGN_OUT_USER_MUTATION,
    //   refetchQuery: {
    //     query: 'CURRENT_USER_QUERY',
    //     variables: {
    //       authToken: user.authToken,
    //     },
    //   },
    // })
    const refetchKey = JSON.stringify(refetchQuery)
    console.log('refetchKey:', refetchKey)

    const cs = cacheStore.get(refetchKey)
    console.log('cs:', cs)
    cacheStore.delete(refetchKey)

    // Get the informations off the cache value to refetch the query
    this.fetchHandler(options)
    console.log('\nREFETCH QUERY:', cacheStore, '\n')
    return
  }

  if (updateItem) {
    const { data, ...keyData } = updateItem
    const updateKey = JSON.stringify(keyData)
    const currentVal = cacheStore.get(updateKey)
    const options = currentVal && currentVal.options

    cacheStore.set(updateKey, { data, options })

    console.log('\nUPDATE CACHE:', cacheStore, '\n')
    return cacheStore
  }

  if (deleteItem) {
    const key = JSON.stringify(deleteItem)
    const has = cacheStore.has(key)

    if (has) {
      cacheStore.delete(key)
    }

    console.log('\nUPDATE CACHE:', cacheStore, '\n')
    return cacheStore
  }

  if (cacheStore.size > 0) {
    console.log('\nRETURN CACHE:', cacheStore, '\n')
    return cacheStore
  }
}

/**
 * Pre-Cache handler method
 *
 * @private
 * @param {Object!} options
 * @param {String} options.refetchQuery
 * @param {Object} options.requestOptions - addition options to fetch request(refer to fetch api)
 * TODO: write types
 */
MinusQL.prototype.preFetchHandler = async function preFetchHandler({
  operation,
  operationName,
  operationType,
  variables,
  refetchQuery,
  requestOptions,
  isMutation,
  updateItem,
  deleteItem,
}) {
  const initializeCacheItemData = {
    operation,
    operationName,
    operationType,
    variables,
    requestOptions,
    refetchQuery,
    updateItem,
    deleteItem,
  }

  // TODO: I feel like we need to check for duplicate cache keys, but haven't been able to produce a test case yet
  let cacheKey = generateCacheKey(initializeCacheItemData)
  const keyIsCached = cacheStore.has(cacheKey)
  if (keyIsCached) {
    const inCacheData = cacheStore.get(cacheKey)
    console.log('inCacheData:', inCacheData)
    console.warn(
      `${
        cacheKey.split(':')[1]
      } has been already declared. This may result in unexpected behavior.`,
    )
  }

  if (isMutation && refetchQuery) {
    await this.cache({ refetchQuery })
    return null
  }

  const cacheData = await this.cache(initializeCacheItemData)

  // If there is data in the cache, return it
  if (cacheData) {
    return cacheData
  }
}

export default MinusQL
