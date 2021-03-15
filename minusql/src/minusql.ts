import fetch from "./utils/isoFetch" // .ts
import { parseGQLString } from "./utils/parseGQLString" // .ts
import { generateCacheKey } from "./utils/generateCacheKey" // .ts
import { appendTypename } from "./utils/appendTypename" // .ts
import { isEmpty } from "./utils/isEmpty" // .ts
import type {
  RequestCredentials,
  RequestHeaders,
  RequestObject,
} from "./interfaces" // .ts

export type FetchPolicy = "cache" | "no-cache"

export interface MinusQLInput {
  uri: string
  credentials?: RequestCredentials
  headers?: RequestHeaders
  requestOptions?: Object
}

export type MinusQLReturn = [Object | null, Error | null]

export type UpdateQuery = { query: string; variables: Object }

export interface ResolverInput {
  variables?: { [key: string]: any }
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  fetchPolicy?: FetchPolicy
}

export interface QueryInput extends ResolverInput {}

export interface MutationInput extends ResolverInput {
  appendToCache?: string
  refetchQuery?: UpdateQuery[]
  deleteCacheKey?: UpdateQuery[]
}

export type Operation = string // gql query string

export interface FetchHandlerOptions {
  variables?: Object // resolver variables
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  fetchPolicy?: FetchPolicy
  appendToCache?: string
  refetchQuery?: UpdateQuery[]
  deleteCacheKey?: UpdateQuery[]
}

export interface InitCacheData {
  operationName: string
  isMutation?: boolean
  data: Object | null
  variables?: Object
  appendToCache?: string
  refetchQuery?: UpdateQuery[]
}

export interface ErrObj {
  path?: string[]
  message: string
}

export interface ResJson {
  errors?: ErrObj[]
  data: Object | null
}

/**
 * The cache
 */
const CACHE = new Map()

export function getCache() {
  return CACHE
}

/**
 * Create a MinusQL instance
 */
/* eslint-disable no-redeclare */
export class MinusQL {
  uri: string
  fetchPolicy?: FetchPolicy
  credentials?: RequestCredentials
  headers?: RequestHeaders
  requestOptions?: Object

  constructor({ uri, credentials, headers, requestOptions }: MinusQLInput) {
    this.uri = uri
    this.credentials = credentials
    this.headers = headers
    this.requestOptions = requestOptions
  }

  /**
   * Query method
   */
  async query(
    operation: Operation,
    options?: QueryInput,
  ): Promise<MinusQLReturn> {
    try {
      if (operation.constructor !== String) {
        return [
          null,
          {
            name: "QUERY_ERROR",
            message: "Invalid type: Query requires query string",
          },
        ]
      }
      return this.fetchHandler(operation, {
        ...options,
        fetchPolicy: options?.fetchPolicy || "cache",
      })
    } catch (err) {
      return [null, { name: "QUERY_ERROR", message: `${err}` }]
    }
  }

  /**
   * Mutation method
   */
  async mutation(
    operation: Operation,
    options?: MutationInput,
  ): Promise<MinusQLReturn> {
    try {
      if (operation.constructor !== String) {
        return [
          null,
          {
            name: "MUTATION_ERROR",
            message: "Invalid type: Mutation requires query string",
          },
        ]
      }
      return this.fetchHandler(operation, {
        ...options,
        fetchPolicy: options?.fetchPolicy || "no-cache",
      })
    } catch (err) {
      return [null, { name: "MUTATION_ERROR", message: `${err}` }]
    }
  }

  /**
   * Fetch handler
   */
  /** @internal */
  async fetchHandler(
    operation: Operation,
    options?: FetchHandlerOptions,
  ): Promise<MinusQLReturn> {
    try {
      operation = appendTypename(operation)
      const [operationType, operationName] = parseGQLString(operation)
      const hitCache =
        options?.fetchPolicy === "cache" || options?.appendToCache

      // Cache stuff
      // //-------------------------------------------
      if (hitCache) {
        const initCache: InitCacheData = {
          operationName,
          isMutation: operationType === "mutation",
          data: null,
          variables: options?.variables,
        }

        // If there is data in the cache, return that data
        const [cacheData, err] = this.preFetchHandler(initCache)
        if (err) {
          console.error(err)
        }
        if (!isEmpty(cacheData)) {
          return [cacheData, null]
        }
      }
      // //-------------------------------------------
      const body: { query: string; variables?: Object } = {
        query: operation,
      }

      if (options?.variables) body.variables = options?.variables
      if (options?.headers) {
        this.headers = { ...this.headers, ...options.headers }
      }
      if (options?.requestOptions) {
        this.requestOptions = {
          ...this.requestOptions,
          ...options.requestOptions,
        }
      }

      const requestObject: RequestObject = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(body),
        credentials: this.credentials || "include",
        ...this.requestOptions,
      }

      console.warn("-----------FETCH-----------")
      const r = await fetch(this.uri, requestObject)
      if (r.ok !== true) {
        console.error(`${r.status} ${r.statusText}`)
      }

      const res: ResJson = await r.json()

      const errName = `Operation failed: ${
        res?.errors &&
        res?.errors.length > 0 &&
        res?.errors[0]?.path &&
        res?.errors[0]?.path.length > 0 &&
        res?.errors[0]?.path[0]
          ? res?.errors[0]?.path[0]
          : "Invalid query"
      }`
      const errMsg = str => {
        try {
          return JSON.parse(str)
        } catch (err) {
          return str
        }
      }

      if (res?.errors) {
        return [
          null,
          {
            name: errName,
            message:
              res?.errors && res?.errors.length > 0 && res.errors[0]?.message
                ? errMsg(res.errors[0]?.message)
                : "No error message was returned",
          },
        ]
      }

      if (options?.deleteCacheKey) {
        await this.deleteCacheKeyHandler(options)
      }

      if (options?.refetchQuery) {
        await this.refetchHandler(options)
      }

      // Cache stuff
      // //-------------------------------------------
      // console.warn("BEFORE SET CACHE", CACHE)
      // Set data in cache
      if (hitCache) {
        this.cacheHandler({
          operationName,
          data: res?.data,
          variables: options?.variables,
          appendToCache: options?.appendToCache,
        })
      }
      // console.warn("AFTER SET CACHE", CACHE)
      // //-------------------------------------------

      return [res.data, null]
    } catch (err) {
      return [null, { name: "FETCH_ERROR", message: `${err}` }]
    }
  }

  async deleteCacheKeyHandler(options) {
    for (const { query, variables } of options.deleteCacheKey) {
      const [_, name] = parseGQLString(query)
      const key = generateCacheKey({ operationName: name, variables })
      CACHE.delete(key)
      await this.refetchHandler(options)
    }
  }

  async refetchHandler(options) {
    for (const { query, variables } of options.refetchQuery) {
      const [_, name] = parseGQLString(query)
      const key = generateCacheKey({ operationName: name, variables })
      CACHE.delete(key)
      await this.fetchHandler(query, {
        variables,
        fetchPolicy: "cache",
      })
    }
  }

  /**
   * Prefetch Handler - Handles Caching Policies
   */
  /** @internal */
  preFetchHandler(initCacheData: InitCacheData): [Object | null, Error | null] {
    // console.warn("-----------PRE-CACHE-----------")
    try {
      if (initCacheData.isMutation) {
        return [null, null]
      }

      const key = generateCacheKey(initCacheData)
      const isCached = CACHE.has(key)

      if (isCached) {
        // console.warn("-----------CACHE DATA EXISTS-----------")
        // console.warn("CACHED DATA", CACHE.get(key))
        return [CACHE.get(key), null]
      }

      // console.warn("-----------NO CACHE DATA-----------")

      return [null, null]
    } catch (err) {
      return [null, err]
    }
  }

  /**
   * Cache handler method
   */
  cacheHandler(initCacheData: InitCacheData): Object | undefined {
    try {
      const operationName = initCacheData?.operationName
      const data = initCacheData?.data
      const appendToCache = initCacheData?.appendToCache
      const key = appendToCache || generateCacheKey(initCacheData)

      // Client side cache works as expected
      // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

      const isCached = CACHE.has(key)

      if (!isCached && data) {
        CACHE.set(key, data)
        console.warn("\nSET CACHE:", CACHE, "\n\n")
        return CACHE
      }

      if (isCached && appendToCache) {
        const cached = CACHE.get(key)

        if (data?.[operationName].constructor === Array) {
          CACHE.set(key, {
            [`${appendToCache}`]: [].concat(
              cached?.[key],
              data?.[operationName],
            ),
          })
          console.warn("\nUPDATE_CACHE (ARRAY):", CACHE, "\n\n")
          return CACHE
        }

        CACHE.set(key, {
          [`${appendToCache}`]: [].concat(cached?.[key], data?.[operationName]),
        })

        console.warn("\nUPDATE_CACHE:", CACHE, "\n\n")
        return CACHE
      }
    } catch (err) {
      throw new Error(`CACHE_ERROR: ${err}`)
    }
  }
}
