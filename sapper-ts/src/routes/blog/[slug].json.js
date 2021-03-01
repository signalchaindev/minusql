import posts from "./_posts.js"

const lookup = new Map()
posts.forEach(post => {
  lookup.set(post.slug, JSON.stringify(post))
})

export function get(req, res, next) {
  // the `slug` parameter is available because
  // this file is called [slug].json.js
  const { slug } = req.params

  if (lookup.has(slug)) {
    res.code(200).header("Content-Type", "application/json")

    res.end(lookup.get(slug))
  } else {
    res.code(404).header("Content-Type", "application/json")

    res.end(
      JSON.stringify({
        message: `Not found`,
      }),
    )
  }
}
