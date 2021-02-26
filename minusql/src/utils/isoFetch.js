const f = m => m
export default typeof global !== "undefined"
  ? async (url, opts) =>
      f(await import("node-fetch"))(url.replace(/^\/\//g, "https://"), opts)
  : window.fetch
