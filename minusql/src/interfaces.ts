export type RequestMethod = "POST"

export interface RequestHeaders {
  Accept: "application/json"
  "Content-Type": "application/json"
  [index: string]: any
}

export type RequestMode = "cors" | "navigate" | "no-cors" | "same-origin"
export type RequestCredentials = "include" | "omit" | "same-origin"
export type RequestCache =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload"

// https://github.com/apollographql/apollo-client/issues/207#issuecomment-260639943
export interface RequestObject {
  method: RequestMethod
  headers: RequestHeaders
  body: string
  mode: RequestMode
  credentials: RequestCredentials
  cache: RequestCache
  [key: string]: any
}
