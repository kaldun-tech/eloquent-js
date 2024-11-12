/* Defines a library for reversing strings, which can be used by both main
 * code and by other scripts that need direct access to this function. */
export function reverse(string) {
  return Array.from(string).reverse().join("");
}
