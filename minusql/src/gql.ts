// @ts-nocheck
// TODO: Write types
export function gql(strings, ...pieces): string {
  return String.raw(
    { raw: strings[0].replace(/[\s,]+/g, " ").trim() },
    ...pieces,
  )
}
