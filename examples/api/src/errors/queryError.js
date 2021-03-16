import { GQLError } from '../utils/GQLError' // .ts

export function queryError() {
  throw new GQLError(
    'Server error #894247527: You requested to throw this error. Here you go.',
    {
      alert:
        'Server error #894247527: You requested to throw this error. Here you go.',
      name: 'Your name is wrong',
      email: 'Your email is wrong',
      password: 'Your password is wrong',
      confirmPassword: 'Your confirm password is wrong',
    },
  )
}
