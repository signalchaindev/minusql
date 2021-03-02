export function gql(str: TemplateStringsArray): string {
  return String.raw`${str[0].replace(/[\s,]+/g, " ").trim()}`
}
