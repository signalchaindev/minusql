import { User } from "../model.js"

export async function signIn(_, { email, password }, ctx) {
  const user = await User.findOne({ email }).catch(console.error)
  if (user.password !== password) {
    throw new Error("Incorrect password")
  }
  ctx.res.setCookie(
    "session",
    { id: user._id },
    { httpOnly: true, maxAge: 1000 * 60 * 24 * 365, secure: false },
  )
  return user
}
