export interface GenCacheKeyInput {
  operationName: string
  variables?: Object
}

export function generateCacheKey({
  operationName,
  variables,
}: GenCacheKeyInput): string {
  try {
    if (variables) {
      return `${operationName}${JSON.stringify(variables)}`
    }
    return `${operationName}`
  } catch (err) {
    throw new Error(err)
  }
}
