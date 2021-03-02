export interface GenCacheKeyInput {
  operationName: string
  variables?: Object
}

export function generateCacheKey({
  operationName,
  variables,
}: GenCacheKeyInput): string {
  if (variables && Object.keys(variables).length === 0) {
    return `${operationName}`
  }
  return `${operationName}${JSON.stringify(variables)}`
}
