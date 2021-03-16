/* eslint-disable no-new-object */

function subscribeOnce(observable) {
  return new Promise(resolve => {
    observable.subscribe(resolve)() // immediately invoke to unsubscribe
  })
}

function update(object, path, value) {
  object.update(o => {
    set(o, path, value)
    return o
  })
}

function cloneDeep(object) {
  return JSON.parse(JSON.stringify(object))
}

function isNullish(value) {
  return value === undefined || value === null
}

function isEmpty(object) {
  return isNullish(object) || Object.keys(object).length <= 0
}

function assignDeep(object, value) {
  if (Array.isArray(object)) {
    return object.map(o => assignDeep(o, value))
  }
  const copy = {}
  for (const key in object) {
    copy[key] =
      typeof object[key] === "object" ? assignDeep(object[key], value) : value
  }
  return copy
}

function set(object, path, value) {
  if (new Object(object) !== object) return object

  if (!Array.isArray(path)) {
    path = path.toString().match(/[^.[\]]+/g) || []
  }

  const result = path
    .slice(0, -1)
    // TODO: replace this reduce with something more readable
    .reduce(
      (accumulator, key, index) =>
        new Object(accumulator[key]) === accumulator[key]
          ? accumulator[key]
          : (accumulator[key] =
              Math.trunc(Math.abs(path[index + 1])) === +path[index + 1]
                ? []
                : {}),
      object,
    )

  result[path[path.length - 1]] = value

  return object
}

export const util = {
  assignDeep,
  cloneDeep,
  isEmpty,
  isNullish,
  set,
  subscribeOnce,
  update,
}
