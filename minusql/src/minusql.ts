import fetch from "./utils/isoFetch.js"
// import gqlParser from "./utils/gql-string-parser" // .ts

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
  variables
  headers
  requestOptions
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

    const [data, error] = await this.fetchHandler(operation, options?.variables)
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
interface FetchHandlerInput {
  operation: string // gql query string
  variables: Object // resolver variables
  // refetchQuery?: Object
  // updateItem?: Object
  // deleteItem?: Object
}

MinusQL.prototype.fetchHandler = async function fetchHandler(
  operation,
  variables: // refetchQuery,
  // updateItem,
  // deleteItem,
  FetchHandlerInput,
): Promise<MinusQLReturn> {
  try {
    // //-------------------------------------------
    // const [operationType, operationName] = gqlParser(operation)
    // console.log("operation:", operation)
    // console.log("operationType:", operationType)
    // console.log("operationName:", operationName)

    // const isQuery = operationType === "query"
    // const isMutation = operationType === "mutation"

    // const initializeCacheItemData = {
    //   operation,
    //   operationName,
    //   operationType,
    //   variables,
    //   refetchQuery,
    //   requestOptions,
    //   isQuery,
    //   isMutation,
    //   data: null,
    //   updateItem,
    //   deleteItem,
    // }

    // // If there is data in the cache, return that data
    // const cacheData = await this.preFetchHandler(initializeCacheItemData)
    // if (cacheData) {
    //   return {
    //     ...cacheData,
    //     error: null,
    //   }
    // }
    // //-------------------------------------------

    const body: { query: string; variables?: Object } = {
      query: operation,
    }
    if (variables) body.variables = variables
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

    console.log("-----------I'M FETCHING!-----------")
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
    // // Set data in cache
    // if (isQuery) {
    //   await this.cache({ data })
    // }
    // //-------------------------------------------

    return [resJson.data, null]
  } catch (err) {
    return [null, { name: "MinusQL error #78464281", message: `${err}` }]
  }
}
