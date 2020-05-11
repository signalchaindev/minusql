export default function validateResolver(
  operationType,
  hasOperation,
  rest = {},
) {
  try {
    if (!hasOperation) {
      throw Error(
        `${operationType} method requires an object argument with a '${operationType}' property`,
      )
    }

    if (Object.keys(rest).length !== 0) {
      for (const key of Object.keys(rest)) {
        this.verbose && console.error(`Error: ${key} is not a valid option`)
      }
    }
  } catch (err) {
    console.error(err)
  }
}
