// @ts-nocheck
import { writable } from "svelte/store" // eslint-disable-line
import { parseGQLString } from "minusql/utils/parseGQLString.js"
import { getClient } from "./context"

/**
 * Cache Store - Set Cache
 */
function setCache() {
  const cacheStore = {}
  const { subscribe, set } = writable(cacheStore)
  return {
    subscribe,
    set(key, data) {
      cacheStore[key] = data
      return set(cacheStore)
    },
  }
}
export const cache = setCache()

/**
 * Use Query
 */
export async function useQuery(operation, opts) {
  const client = getClient()
  const [data, error] = await client.query(operation, opts)
  if (error) {
    return [null, error]
  }

  const [_, operationName] = parseGQLString(operation)
  cache?.set(operationName, data?.[operationName])

  return [cache, null]
}

/**
 * Use Mutation
 */
export async function useMutation(operation, opts) {
  const client = getClient()
  const [data, error] = await client.mutation(operation, opts)
  if (error) {
    return [null, error]
  }

  if (opts?.appendToCache) {
    const [_, operationName] = parseGQLString(operation)
    let cachedData
    cache?.subscribe(v => {
      cachedData = v
    })

    if (data?.[operationName].constructor === Array) {
      cache?.set(opts.appendToCache, [
        ...cachedData?.[opts.appendToCache],
        ...data?.[operationName],
      ])
      return [data, null]
    }

    cache?.set(opts.appendToCache, [
      ...cachedData?.[opts.appendToCache],
      data?.[operationName],
    ])
    return [data, null]
  }

  return [data, null]
}
