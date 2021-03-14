// @ts-nocheck
import { writable } from "svelte/store"
import { parseGQLString } from "minusql/utils/parseGQLString.js"
import { client } from "./context"

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
 * User Query
 */
export async function useQuery(operation, opts) {
  const [data, error] = await client.query(operation, opts)
  if (error) {
    return [null, error]
  }
  const [_, operationName] = parseGQLString(operation)
  cache?.set(operationName, data?.[operationName])
  return [data, null]
}

/**
 * User Mutation
 */
export async function useMutation(operation, opts) {
  const [data, error] = await client.mutation(operation, opts)
  if (error) {
    return [null, error]
  }

  if (opts?.updateQuery) {
    const [_, operationName] = parseGQLString(operation)
    let cachedData
    cache?.subscribe(v => {
      cachedData = v
    })

    if (data?.[operationName].constructor === Array) {
      cache?.set(opts.updateQuery, [
        ...cachedData?.[opts.updateQuery],
        ...data?.[operationName],
      ])
      return [data, null]
    }

    cache?.set(opts.updateQuery, [
      ...cachedData?.[opts.updateQuery],
      data?.[operationName],
    ])
    return [data, null]
  }

  return [data, null]
}
