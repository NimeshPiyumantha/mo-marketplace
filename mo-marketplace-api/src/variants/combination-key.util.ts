/**
 * Generates a combination_key from variant attributes.
 *
 * Keys are sorted alphabetically for consistency, then values are
 * joined with hyphens. This ensures {color:"red", size:"M"} and
 * {size:"M", color:"red"} produce the same key: "red-M".
 *
 * Example: {color: "red", size: "M", material: "cotton"} → "red-M-cotton"
 */
export function generateCombinationKey(
  attributes: Record<string, string>,
): string {
  return Object.keys(attributes)
    .sort()
    .map((key) => String(attributes[key]).trim())
    .join('-');
}
