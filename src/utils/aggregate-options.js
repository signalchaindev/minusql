import isEmpty from './is-empty.js'

export default function aggregateOptions({
  operation,
  variables,
  requestOptions,
  refetchQuery,
  updateItem,
  deleteItem,
}) {
  const options = {
    operation,
    variables,
  }

  if (!isEmpty(requestOptions)) options.requestOptions = requestOptions
  if (!isEmpty(refetchQuery)) options.refetchQuery = refetchQuery
  if (!isEmpty(updateItem)) options.updateItem = updateItem
  if (!isEmpty(deleteItem)) options.deleteItem = deleteItem

  return options
}
