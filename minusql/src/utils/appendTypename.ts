export function appendTypename(operation: string): string {
  const opSplit = operation.split("{")
  return opSplit
    .map((frag, i) => {
      if (i <= 1) return frag
      return ` __typename ${frag}`
    })
    .join("{")
}
