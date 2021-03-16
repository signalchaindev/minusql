export async function signOut(_, __, ctx) {
  ctx.res.clearCookie("session")
  return "You are signed out"
}
