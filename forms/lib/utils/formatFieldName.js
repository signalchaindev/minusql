export function formatFieldName(str) {
  const cleanStr = str.replace(/\s|-|_/g, " ")
  const stripDoubleSpace = cleanStr.replace(/\s+/gi, " ")
  const camelCase = stripDoubleSpace
    .split(" ")
    .map((word, i) => {
      if (i === 0) return word.toLowerCase()
      const splitChar = word.split("")
      splitChar.splice(0, 1, splitChar[0].toUpperCase())
      return splitChar.join("")
    })
    .join("")
  return camelCase
}
