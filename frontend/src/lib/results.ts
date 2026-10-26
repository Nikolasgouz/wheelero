import { t } from '../i18n'
import type { DrawResult } from '../types'

export function resultsText(title: string, results: DrawResult[]): string {
  return (
    '\uFEFF' +
    [
      `${t.brand} — ${t.results}`,
      `${t.title}: ${title}`,
      t.historyCount(results.length),
      '',
      ...results.map((result, index) => `${index + 1}. ${result.label}`),
    ].join('\r\n')
  )
}
