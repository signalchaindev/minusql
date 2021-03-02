import posts from "./_posts.js"

const contents = JSON.stringify(
  posts.map(post => {
    return {
      title: post.title,
      slug: post.slug,
    }
  }),
)

export function get(req, res) {
  res.code(200).header("Content-Type", "application/json")

  res.end(contents)
}