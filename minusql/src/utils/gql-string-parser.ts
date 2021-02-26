export default function gqlParser(operation) {
  // console.log('operation:', operation)
  const [operationType, rest] = operation && operation.split(" ")
  const [operationName] = rest && rest.split("(")

  return [operationType, operationName]
}
