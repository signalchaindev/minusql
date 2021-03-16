import { User } from "../model.js"

export async function signUp(_, { email, password }, ctx) {
  const user = await User.create({ email, password }).catch(console.error)
  ctx.res.setCookie(
    "session",
    { id: user._id },
    { httpOnly: true, maxAge: 1000 * 60 * 24 * 365, secure: false },
  )
  return user
}
