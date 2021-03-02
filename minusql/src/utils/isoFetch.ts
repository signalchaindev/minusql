import { RequestObject } from "../interfaces" // .ts

const f = m => m
export const isoFetch =
  typeof global !== "undefined"
    ? async (url: string, opts: RequestObject) =>
        f(await import("node-fetch"))(url.replace(/^\/\//g, "https://"), opts)
    : window.fetch

export default isoFetch
