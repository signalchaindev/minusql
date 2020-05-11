import isEmpty from './is-empty.js'

export default function aggregateOptions({
  operation,
  variables,
  requestOptions,
  refetchQuery,
}) {
  const options = {
    operation,
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
