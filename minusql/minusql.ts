import fetch from "./utils/isoFetch" // .ts
import { parseGQLString } from "./utils/parseGQLString" // .ts
import { generateCacheKey } from "./utils/generateCacheKey" // .ts
import { isEmpty } from "./utils/isEmpty" // .ts
import { InitCacheData } from "./interfaces" // .ts

type FetchPolicy = "cache" | "no-cache"

type RequestMethod = "POST"

interface RequestHeaders {
  Accept: "application/json"
  "Content-Type": "application/json"
  [index: string]: any
}

type RequestMode = "cors" | "navigate" | "no-cors" | "same-origin"
type RequestCredentials = "include" | "omit" | "same-origin"
type RequestCache =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload"

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
  fetchPolicy?: FetchPolicy
  credentials?: string
  headers?: RequestHeaders
  requestOptions?: Object
}

type MinusQLReturn = [Object | null, Error | null]

/**
 * The cache
 */
const STORE = new Map()

/**
 * Create a MinusQL instance
 */
export function MinusQL(
  this: MinusQLInput,
  { uri, fetchPolicy, credentials, headers, requestOptions }: MinusQLInput,
): void {
  this.uri = uri
  this.fetchPolicy = fetchPolicy || "cache"
  this.credentials = credentials
  this.headers = headers
  this.requestOptions = requestOptions
}

/**
 * Query method
 */
type Operation = string // gql query string
interface QueryInput {
  variables?: Object
  fetchPolicy?: FetchPolicy
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
}

MinusQL.prototype.query = async function query(
  op: Operation,
  opts: QueryInput,
): Promise<MinusQLReturn> {
  try {
    if (!op) {
      return [
        null,
        {
          name: "MinusQL error #57456432",
          message: "Query operation is required",
        },
      ]
    }
    if (op.constructor !== String) {
      return [
        null,
        {
          name: "MinusQL error #36457425",
          message:
            "Invalid type: Query's first argument should be typeof string",
        },
      ]
    }
    return this.fetchHandler(op, opts)
  } catch (err) {
    return [null, { name: "MinusQL error #23675434", message: `${err}` }]
  }
}

/**
 * Mutation method
 */
interface MutationInput {
  variables: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  updateQuery?: string
}

MinusQL.prototype.mutation = async function mutation(
  op: Operation,
  opts: MutationInput,
): Promise<MinusQLReturn> {
  try {
    if (!op) {
      return [
        null,
        {
          name: "MinusQL error #64574532",
          message: "Mutation operation is required",
        },
      ]
    }
    if (op.constructor !== String) {
      return [
        null,
        {
          name: "MinusQL error #23456784",
          message:
            "Invalid type: Mutation's first argument should be typeof string",
        },
      ]
    }
    // @ts-expect-error
    opts?.fetchPolicy = opts?.updateQuery ? "cache" : "no-cache"
    return this.fetchHandler(op, opts)
  } catch (err) {
    return [null, { name: "MinusQL error #43482367", message: `${err}` }]
  }
}

/**
 * Fetch handler
 */
interface FetchHandlerOptions {
  operation: string // gql query string
  variables: Object // resolver variables
  fetchPolicy?: FetchPolicy
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  updateQuery?: string
  // deleteCacheItem?: Object
}

MinusQL.prototype.fetchHandler = async function fetchHandler(
  operation,
  options: FetchHandlerOptions,
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

    // Cache stuff
    // //-------------------------------------------
    let operationName
    if (this.fetchPolicy === "cache" || options?.updateQuery) {
      const [opType, opName] = parseGQLString(operation)
      operationName = opName

      const initCache: InitCacheData = {
        operationName: opName,
        isMutation: opType === "mutation",
        data: null,
        variables: options?.variables,
      }

      // If there is data in the cache, return that data
      const [cacheData, err] = await preFetch(initCache)
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

    // console.warn("-----------FETCH-----------")
    const r = await fetch(this.uri, requestObject)
    if (r.ok !== true) {
      console.error(`${r.status} ${r.statusText}`)
    }

    interface ErrObj {
      path?: string[]
      message: string
    }

    interface ResJson {
      errors?: ErrObj[]
      data: Object | null
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
    if (this.fetchPolicy === "cache" || options?.updateQuery) {
      await this.cache({
        operationName,
        data: res.data,
        updateQuery: options?.updateQuery,
      })
    }
    // console.warn("AFTER SET CACHE", STORE)
    // //-------------------------------------------

    return [res.data, null]
  } catch (err) {
    return [null, { name: "MinusQL error #78464281", message: `${err}` }]
  }
}

/**
 * Prefetch Handler - Handles Caching Policies
 * @private
 */

async function preFetch(initCache: InitCacheData) {
  // console.warn("-----------PRE-CACHE-----------")
  try {
    if (initCache.isMutation) {
      return [null, null]
    }

    const key = generateCacheKey(initCache)
    const isCached = STORE.has(key)

    if (isCached) {
      // console.warn("-----------CACHE DATA EXISTS-----------")
      // console.warn("CACHED DATA", STORE.get(key))
      return [STORE.get(key), null]
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

interface CacheInput {
  operationName: string
  data: Object
  updateQuery: string
}

MinusQL.prototype.cache = async function cache(initCache: CacheInput) {
  const operationName = initCache?.operationName
  const data = initCache?.data
  const updateQuery = initCache?.updateQuery
  const key = updateQuery || generateCacheKey({ operationName })

  // Client side cache works as expected
  // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

  const isCached = STORE.has(key)

  if (!isCached && data) {
    STORE.set(key, data)
    // console.warn("\nSET CACHE:", STORE, "\n\n")
    return // eslint-disable-line
  }

  if (isCached && updateQuery) {
    const cached = STORE.get(key)

    if (data?.[operationName].constructor === Array) {
      STORE.set(key, {
        [`${updateQuery}`]: [].concat(cached?.[key], data?.[operationName]),
      })
      // console.warn("\nUPDATE_CACHE (ARRAY):", STORE, "\n\n")
      return // eslint-disable-line
    }

    STORE.set(key, {
      [`${updateQuery}`]: [].concat(cached?.[key], data?.[operationName]),
    })

    // console.warn("\nUPDATE_CACHE:", STORE, "\n\n")
    return // eslint-disable-line
  }
}
