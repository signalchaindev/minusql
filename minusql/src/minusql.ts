import fetch from "./utils/isoFetch" // .ts
import { parseGQLString } from "./utils/parseGQLString" // .ts
import { generateCacheKey } from "./utils/generateCacheKey" // .ts
import { isEmpty } from "./utils/isEmpty" // .ts
import { RequestCredentials, RequestHeaders, RequestObject } from "./interfaces" // .ts

export type FetchPolicy = "cache" | "no-cache"

export interface MinusQLInput {
  uri: string
  fetchPolicy?: FetchPolicy
  credentials?: RequestCredentials
  headers?: RequestHeaders
  requestOptions?: Object
}

export type MinusQLReturn = [Object | null, Error | null]

export interface ResolverInput {
  variables?: { [key: string]: any }
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
}

export interface QueryInput extends ResolverInput {
  fetchPolicy?: FetchPolicy
}

export interface MutationInput extends ResolverInput {
  updateQuery?: string
}

export type Operation = string // gql query string

export interface FetchHandlerOptions {
  variables?: Object // resolver variables
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  fetchPolicy?: FetchPolicy
  updateQuery?: string
}

export interface InitCacheData {
  operationName: string
  isMutation?: boolean
  data: Object | null
  variables?: Object
  updateQuery?: string
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
const STORE = new Map()

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

  constructor({
    uri,
    fetchPolicy,
    credentials,
    headers,
    requestOptions,
  }: MinusQLInput) {
    this.uri = uri
    this.fetchPolicy = fetchPolicy || "cache"
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
      if (!operation) {
        return [
          null,
          {
            name: "QUERY_ERROR",
            message: "Operation is required",
          },
        ]
      }
      if (operation.constructor !== String) {
        return [
          null,
          {
            name: "QUERY_ERROR",
            message: "Invalid type: first arg should be typeof string",
          },
        ]
      }
      return this.fetchHandler(operation, options)
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
      if (!operation) {
        return [
          null,
          {
            name: "MUTATION_ERROR",
            message: "Mutation operation is required",
          },
        ]
      }
      if (operation.constructor !== String) {
        return [
          null,
          {
            name: "MUTATION_ERROR",
            message: "Invalid type: first arg should be typeof string",
          },
        ]
      }
      // @ts-expect-error
      options?.fetchPolicy = options?.updateQuery ? "cache" : "no-cache"
      return this.fetchHandler(operation, options)
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
      if (options?.fetchPolicy) {
        this.fetchPolicy = options?.fetchPolicy
      }
      if (options?.headers) {
        this.headers = { ...this.headers, ...options.headers }
      }
      if (options?.requestOptions) {
        this.requestOptions = {
          ...this.requestOptions,
          ...options.requestOptions,
        }
      }

      const hitCache = this.fetchPolicy === "cache" || options?.updateQuery

      // Cache stuff
      // //-------------------------------------------
      let operationName: string = ""
      if (hitCache) {
        const [opType, opName] = parseGQLString(operation)
        operationName = opName

        const initCache: InitCacheData = {
          operationName: opName,
          isMutation: opType === "mutation",
          data: null,
          variables: options?.variables,
        }

        // If there is data in the cache, return that data
        const [cacheData, err] = await this.preFetch(initCache)
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

      // Cache stuff
      // //-------------------------------------------
      // console.warn("BEFORE SET CACHE", STORE)
      // Set data in cache
      if (hitCache) {
        await this.cache({
          operationName,
          data: res?.data,
          variables: options?.variables,
          updateQuery: options?.updateQuery,
        })
      }
      // console.warn("AFTER SET CACHE", STORE)
      // //-------------------------------------------

      return [res.data, null]
    } catch (err) {
      return [null, { name: "FETCH_ERROR", message: `${err}` }]
    }
  }

  /**
   * Prefetch Handler - Handles Caching Policies
   */
  /** @internal */
  async preFetch(initCacheData: InitCacheData): Promise<any> {
    console.warn("-----------PRE-CACHE-----------")
    try {
      if (initCacheData.isMutation) {
        return [null, null]
      }

      const key = generateCacheKey(initCacheData)
      const isCached = STORE.has(key)

      if (isCached) {
        console.warn("-----------CACHE DATA EXISTS-----------")
        console.warn("CACHED DATA", STORE.get(key))
        return [STORE.get(key), null]
      }

      console.warn("-----------NO CACHE DATA-----------")

      return [null, null]
    } catch (err) {
      return [null, err]
    }
  }

  /**
   * Cache handler method
   */
  async cache(initCacheData: InitCacheData): Promise<void> {
    try {
      const operationName = initCacheData?.operationName
      const data = initCacheData?.data
      const updateQuery = initCacheData?.updateQuery
      const key = updateQuery || generateCacheKey(initCacheData)

      // Client side cache works as expected
      // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

      const isCached = STORE.has(key)

      if (!isCached && data) {
        STORE.set(key, data)
        console.warn("\nSET CACHE:", STORE, "\n\n")
        return // eslint-disable-line
      }

      if (isCached && updateQuery) {
        const cached = STORE.get(key)

        if (data?.[operationName].constructor === Array) {
          STORE.set(key, {
            [`${updateQuery}`]: [].concat(cached?.[key], data?.[operationName]),
          })
          console.warn("\nUPDATE_CACHE (ARRAY):", STORE, "\n\n")
          return // eslint-disable-line
        }

        STORE.set(key, {
          [`${updateQuery}`]: [].concat(cached?.[key], data?.[operationName]),
        })

        console.warn("\nUPDATE_CACHE:", STORE, "\n\n")
        return // eslint-disable-line
      }
    } catch (err) {
      throw new Error(`CACHE_ERROR: ${err}`)
    }
  }
}
