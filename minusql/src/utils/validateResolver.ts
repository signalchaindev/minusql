type ValidateResolverReturn = Error | null

export default function validateResolver(
  operationType: string,
  hasOperation: boolean,
  rest: { [key: string]: string } = {},
): ValidateResolverReturn {
  try {
    if (!hasOperation) {
      return {
        name: '#736592202',
        message: `${operationType} method requires a '${operationType}' operation as a GQL string`,
      }
    }

    if (Object.keys(rest).length !== 0) {
      return {
        name: '#3425822457',
        message: `${Object.keys(rest)[0]} is not a valid option`,
      }
    }

    return null
  } catch (err) {
    return { name: '#7538289028', message: err }
  }
}
