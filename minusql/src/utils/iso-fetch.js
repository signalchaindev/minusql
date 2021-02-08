function r(m) {
  return (m && m.default) || m
}

module.exports = global.fetch =
  global.fetch ||
  (typeof process !== 'undefined' &&
    function (url, opts) {
      return r(require('node-fetch'))(url.replace(/^\/\//g, 'https://'), opts)
    })
