function gql(strings, ...pieces) {
  return String.raw({ raw: normalizeStr(strings[0]) }, ...pieces)
}

function normalizeStr(string) {
  return string.replace(/[\s,]+/g, ' ').trim()
}

export default gql
