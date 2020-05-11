import isEmpty from './is-empty.js'

export default function aggregateOptions(
  resolver,
  variables,
  requestOptions,
  refetchQuery,
) {
  const options = {
    operation: resolver,
    variables,
  }

  if (!isEmpty(refetchQuery)) {
    options.refetchQuery = refetchQuery
  }

  if (!isEmpty(requestOptions)) {
    options.requestOptions = requestOptions
  }

  return options
}
