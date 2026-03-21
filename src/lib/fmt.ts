/** Format a number as Botswana Pula with comma thousands and 2 decimal places. e.g. 1234.5 → "P 1,234.50" */
export function fmtPrice(n: number): string {
  return "P " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
