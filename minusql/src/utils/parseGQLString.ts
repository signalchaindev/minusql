export function parseGQLString(operation) {
  const [operationType] = operation && operation.split(" ")
  const [_, operationName] = operation && operation.split("{")
  return [operationType.trim(), operationName.trim()]
}
