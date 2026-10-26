// Spreadsheet cells and ordinary lines are both entries. Preserve duplicates.
export function parseEntries(text: string): string[] {
  return text
    .split(/[\r\n\t]+/)
    .map((value) => value.trim())
    .filter(Boolean)
}
