export function isEmpty(
  value: undefined | null | string | number | Array<any> | Object,
): boolean {
  if (value && value.constructor === Boolean) {
    console.warn(
      "Function return handles boolean parameters as a pass through, returning it's original value.\nConsider refactoring the argument's type to be a non-nullable, explicit boolean value or another data structure that may be null.",
    )
    return value
  }
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" && isNaN(value)) ||
    (value.constructor === String && value.trim().length === 0) ||
    (value.constructor === Array && value.length === 0) ||
    (value.constructor === Object && Object.keys(value).length === 0)
  )
}
