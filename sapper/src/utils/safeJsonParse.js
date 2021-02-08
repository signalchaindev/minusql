/**
 * @param {String} Any
 *
 * @return {Array}
 * if param string is valid JSON, safeJsonParse returns the parsed JSON and null
 * if param string is *not* valid JSON, safeJsonParse returns the original string and null
 */
export function safeJsonParse(str) {
  try {
    return [JSON.parse(str), null];
  } catch (err) {
    return [str, err];
  }
}
