export function gql(str: string): string {
  return String.raw`${str.replace(/[\s,]+/g, " ").trim()}`
}
