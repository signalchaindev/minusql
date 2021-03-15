// @ts-nocheck
import { writable } from "svelte/store"
import { getCache } from "minusql"
import { getClient } from "./context" // .ts
import { mapToObject } from "./utils" // .ts

/**
 * Cache Store - Set Cache
 */
function setCache() {
  const cacheStore = {}
  const { subscribe, set } = writable(cacheStore)
  return {
    subscribe,
    set(cache) {
      return set(cache)
    },
  }
}
export const cache = setCache()

/**
 * Use Query
 */
export async function useQuery(operation, opts) {
  const client = getClient()
  const CACHE = getCache()
  const [_, error] = await client.query(operation, opts)
  if (error) {
    return [null, error]
  }

  cache?.set(mapToObject(CACHE))

  return [cache, null]
}

/**
 * Use Mutation
 */
export async function useMutation(operation, opts) {
  const client = getClient()
  const CACHE = getCache()
  const [data, error] = await client.mutation(operation, opts)
  if (error) {
    return [null, error]
  }

  cache?.set(mapToObject(CACHE))

  return [data, null]
}
