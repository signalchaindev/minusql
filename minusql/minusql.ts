import fetch from "./utils/isoFetch" // .ts
import { parseGQLString } from "./utils/parseGQLString" // .ts
import { generateCacheKey } from "./utils/generateCacheKey" // .ts
import { isEmpty } from "./utils/isEmpty" // .ts
import { InitCacheData } from "./interfaces" // .ts

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
  credentials?: string
  headers?: RequestHeaders
  requestOptions?: Object
}

type MinusQLReturn = [Object | null, Error | null]

/**
 * The cache
 */
const cacheStore = new Map()

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

/**
 * Query method
 */
type Operation = string // gql query string
interface QueryInput {
  variables?: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
}

MinusQL.prototype.query = function query(
  operation: Operation,
  options: QueryInput,
): Promise<MinusQLReturn> | MinusQLReturn {
  try {
    if (!operation) {
      return [
        null,
        {
          name: "MinusQL error #57456432",
          message: "Query operation is required",
        },
      ]
    }
    if (operation.constructor !== String) {
      return [
        null,
        {
          name: "MinusQL error #36457425",
          message:
            "Invalid type: Query's first argument should be typeof string",
        },
      ]
    }
    return this.aggregateResolvers(operation, options)
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

MinusQL.prototype.mutation = function mutation(
  operation: Operation,
  options: MutationInput,
): Promise<MinusQLReturn> | MinusQLReturn {
  try {
    if (!operation) {
      return [
        null,
        {
          name: "MinusQL error #64574532",
          message: "Mutation operation is required",
        },
      ]
    }
    if (operation.constructor !== String) {
      return [
        null,
        {
          name: "MinusQL error #23456784",
          message:
            "Invalid type: Mutation's first argument should be typeof string",
        },
      ]
    }
    return this.aggregateResolvers(operation, options)
  } catch (err) {
    return [null, { name: "MinusQL error #43482367", message: `${err}` }]
  }
}

/**
 * Aggregate Resolvers method
 */
interface AggregateResolveOptions {
  variables: Object
  headers?: RequestHeaders // additional headers (refer to fetch api)
  requestOptions?: Object // additional options to fetch request (refer to fetch api)
  updateQuery?: string
}

MinusQL.prototype.aggregateResolvers = async function aggregateResolvers(
  operation: Operation,
  options: AggregateResolveOptions,
): Promise<MinusQLReturn> {
  try {
    if (options?.headers) {
      this.headers = { ...this.headers, ...options.headers }
    }
    if (options?.requestOptions) {
      this.requestOptions = {
        ...this.requestOptions,
        ...options.requestOptions,
      }
    }

    const [data, error] = await this.fetchHandler(operation, options)
    if (error !== null) {
      return [null, error]
    }
    return [data, null]
  } catch (err) {
    return [null, { name: "MinusQL error #75382890", message: `${err}` }]
  }
}

/**
 * Fetch handler
 */
interface FetchHandlerOptions {
  operation: string // gql query string
  variables: Object // resolver variables
  updateQuery?: string
  // refetchQuery?: Object
  // deleteItem?: Object
}

MinusQL.prototype.fetchHandler = async function fetchHandler(
  operation,
  options: FetchHandlerOptions,
): Promise<MinusQLReturn> {
  try {
    // //-------------------------------------------
    const [operationType, operationName] = parseGQLString(operation)
    const isQuery = operationType === "query"
    const isMutation = operationType === "mutation"

    const initCacheData: InitCacheData = {
      operationName,
      isMutation,
      data: null,
    }

    // If there is data in the cache, return that data
    const [cacheData, err] = await preFetchHandler(initCacheData)
    if (err) {
      console.error(err)
    }
    if (!isEmpty(cacheData)) {
      return [cacheData, null]
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

    console.warn("-----------I'M FETCHING!-----------")
    const res = await fetch(this.uri, requestObject)
    if (res.ok !== true) {
      console.error(`${res.status} ${res.statusText}`)
    }

    interface ErrObj {
      path?: string[]
      message: string
    }

    interface ResJson {
      errors?: ErrObj[]
      data: Object | null
    }

    const resJson: ResJson = await res.json()

    const fmtErrName = `Operation failed: ${
      resJson?.errors &&
      resJson?.errors.length > 0 &&
      resJson?.errors[0]?.path &&
      resJson?.errors[0]?.path.length > 0 &&
      resJson?.errors[0]?.path[0]
        ? resJson?.errors[0]?.path[0]
        : "Invalid query"
    }`
    const fmtErrMsg = str => {
      try {
        return JSON.parse(str)
      } catch (err) {
        return str
      }
    }

    if (resJson?.errors) {
      return [
        null,
        {
          name: fmtErrName,
          message:
            resJson?.errors &&
            resJson?.errors.length > 0 &&
            resJson.errors[0]?.message
              ? fmtErrMsg(resJson.errors[0]?.message)
              : "No error message was returned",
        },
      ]
    }

    // //-------------------------------------------
    console.log("BEFORE SET CACHE")
    // Set data in cache
    if (isQuery || options?.updateQuery) {
      await this.cache({
        operationName,
        data: resJson.data,
        updateQuery: options?.updateQuery,
      })
    }
    console.log("AFTER SET CACHE")
    // //-------------------------------------------

    return [resJson.data, null]
  } catch (err) {
    return [null, { name: "MinusQL error #78464281", message: `${err}` }]
  }
}

/**
 * Prefetch Handler - Handles Caching Policies
 * @private
 */

async function preFetchHandler(initCacheData: InitCacheData) {
  try {
    if (initCacheData.isMutation) {
      return [null, null]
    }

    const cacheKey = generateCacheKey(initCacheData)
    const keyIsCached = cacheStore.has(cacheKey)

    if (keyIsCached) {
      return [
        {
          [`${initCacheData.operationName}`]: cacheStore.get(cacheKey),
        },
        null,
      ]
    }

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

MinusQL.prototype.cache = async function cache(initCacheData: CacheInput) {
  const operationName = initCacheData?.operationName
  const data = initCacheData?.data
  const updateQuery = initCacheData?.updateQuery
  const cacheKey = updateQuery || generateCacheKey({ operationName })

  // Client side cache works as expected
  // Server side cache works, but doesn't self isolate in regards to multiple users session data (test by opening different browsers, with different users logged in separately)

  const keyIsCached = cacheStore.has(cacheKey)

  if (!keyIsCached && data) {
    cacheStore.set(cacheKey, data)
    console.log("\nSET CACHE:", cacheStore, "\n\n")
    return // eslint-disable-line
  }

  if (keyIsCached && updateQuery) {
    const cachedData = cacheStore.get(cacheKey)

    //! here's a bug - on the second todo entry this fails
    console.log("***cachedData***:", cachedData)
    console.log("***data***:", data)

    if (data?.[operationName].constructor === Array) {
      cacheStore.set(cacheKey, [
        ...cachedData?.[cacheKey],
        ...data?.[operationName],
      ])
      console.log("\nUPDATE_CACHE:", cacheStore, "\n\n")
      return // eslint-disable-line
    }

    cacheStore.set(cacheKey, [...cachedData?.[cacheKey], data?.[operationName]])

    console.log("\nUPDATE_CACHE:", cacheStore, "\n\n")
    return // eslint-disable-line
  }
}
