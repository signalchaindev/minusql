export const isEmpty = value =>
  value === false ||
  value === undefined ||
  value === null ||
  (value.constructor === Array && value.length === 0) ||
  (value.constructor === Object && Object.keys(value).length === 0) ||
  (value.constructor === String && value.trim().length === 0)
