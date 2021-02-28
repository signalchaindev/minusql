interface GenCacheKeyInput {
  operationName: string
}

export function generateCacheKey({ operationName }: GenCacheKeyInput) {
  return `${operationName}`
}
