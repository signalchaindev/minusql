// @ts-nocheck
// TODO: Write types
export function gql(strings, ...rest): string {
  return String.raw({ raw: strings[0].replace(/[\s,]+/g, " ").trim() }, ...rest)
}
