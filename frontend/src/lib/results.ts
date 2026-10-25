import { t } from '../i18n'
import type { DrawResult } from '../types'

export function resultsCsv(title: string, results: DrawResult[]): string {
  const rows = [
    t.resultCsvHeaders,
    ...results.map((result) => [
      title,
      result.label,
      new Date(result.created_at).toISOString(),
      result.source,
      result.id,
      result.option_id,
    ]),
  ]
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            // Spreadsheet exports must treat user-entered formulas as literal text.
            const value = /^\s*[=+@-]|^[\t\r\n]/.test(cell) ? `'${cell}` : cell
            return `"${value.replaceAll('"', '""')}"`
          })
          .join(','),
      )
      .join('\r\n') +
    '\r\n'
  )
}
