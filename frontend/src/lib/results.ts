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
      ...results.map(
        (result, index) =>
          `${index + 1}. ${result.label}\r\n   ${new Date(result.created_at).toISOString()} | ${result.source === 'server' ? t.server : t.offlineResult}\r\n`,
      ),
    ].join('\r\n')
  )
}
