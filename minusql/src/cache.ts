import { MinusQL } from "./minusql" // .ts
import generateCacheKey from "./utils/generate-cache-key.js"

/**
 * The cache
 */
const cacheStore = new Map()

/**
 * Cache handler method
 *
 * @param {Object!} initializeCacheItemData
 * @param {String} initializeCacheItemData.operation
 * @param {String} initializeCacheItemData.operationName
 * @param {String} initializeCacheItemData.operationType
 * @param {Object || String} initializeCacheItemData.variables
 * @param {Object} initializeCacheItemData.refetchQuery
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
    variables,
    refetchQuery,
    requestOptions,
    data,
    updateItem,
    deleteItem,
  } = initializeCacheItemData

  const cacheKey = generateCacheKey({
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
    console.log("\nSET CACHE:", cacheStore, "\n")
    return
  }

  if (keyIsCached && cacheKey && !refetchQuery && !updateItem && !deleteItem) {
    const value = cacheStore.get(cacheKey)
    console.log("\nGET CACHED ITEM:", cacheStore, "\n")
    return value
  }

  // if (refetchQuery) {
  //   // const refetchKey = JSON.stringify(refetchQuery)
  //   // console.log('refetchKey:', refetchKey)
  //   // cacheStore.delete(cacheKey)

  //   // // Get the informations off the cache value to refetch the query
  //   this.fetchHandler(options)
  //   console.log('\nREFETCH QUERY:', cacheStore, '\n')

  //   const cs = cacheStore.get(cacheKey)
  //   console.log('cs:', cs)
  // }

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
 * @param {Object} initializeCacheItemData.refetchQuery
 * @param {Object} initializeCacheItemData.requestOptions
 * @param {Boolean} initializeCacheItemData.isQuery
 * @param {Boolean} initializeCacheItemData.isMutation
 * @param {Object} initializeCacheItemData.data
 * @param {} initializeCacheItemData.updateItem
 * @param {} initializeCacheItemData.deleteItem
 */
MinusQL.prototype.preFetchHandler = async function preFetchHandler(
  initializeCacheItemData,
) {
  const { isMutation, refetchQuery } = initializeCacheItemData

  let cacheData
  const cacheKey = generateCacheKey(initializeCacheItemData)
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
