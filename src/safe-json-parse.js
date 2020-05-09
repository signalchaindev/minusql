/**
 * @param {String} Any
 *
 * @return {Array}
 * if param string is valid JSON, safeJsonParse returns the parsed JSON as the 0th index and null as the 1st index
 * if param string is *not* valid JSON, safeJsonParse returns the original string as the 0th index and the classic JSON parse error as the 1st index
 */
export default function safeJsonParse(str) {
  try {
    return [JSON.parse(str), null]
  } catch (err) {
    return [str, err]
  }
}
