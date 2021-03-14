export type ParseGQLStringReturn = [string, string]

export function parseGQLString(operation: string): ParseGQLStringReturn {
  const operationType = operation && operation.split(" ")[0]
  const idx = operation && operation.split("{")[1]
  const idx2 = idx.split(" ")[1]
  const operationName = idx2.split("(")[0]
  return [operationType.trim(), operationName.trim()]
}
