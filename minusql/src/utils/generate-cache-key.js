export default function generateCacheKey({
  operation,
  operationName,
  variables,
  refetchQuery,
  updateItem,
  deleteItem,
}) {
  if (operation && !updateItem && !deleteItem) {
    return JSON.stringify({
      query: refetchQuery ? refetchQuery.query : operationName,
      variables: refetchQuery ? refetchQuery.variables : variables,
    })
  }
}
