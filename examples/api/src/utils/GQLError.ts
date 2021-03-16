import { isEmpty } from "./isEmpty" // .ts

/**
 * GQLError logs error description on the server and throws an error to be sent to the client
 *
 * @param {string} errorDescription - Logs to server by default and gets thrown to client as an alert if no errorObject is present
 * @param {Object} errorObject
 *
 * @throws {string} - Stringified error object to send to the client
 */
export function GQLError(
  errorDescription: string,
  errorObject?: { [key: string]: string },
) {
  console.error(`Error: ${errorDescription}`)
  let err = errorObject

  if (isEmpty(errorObject)) {
    err = { alert: errorDescription }
  }

  throw new Error(JSON.stringify(err))
}
