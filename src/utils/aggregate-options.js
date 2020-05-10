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

  if (!isEmpty(requestOptions)) {
    options.requestOptions = requestOptions
  }

  if (!isEmpty(refetchQuery)) {
    options.refetchQuery = refetchQuery
  }

  return options
}
