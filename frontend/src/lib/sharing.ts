import { z } from 'zod'
import { backupWheelSchema, type Wheel } from '../types'

const shareSchema = z.object({
  version: z.literal(1),
  wheel: backupWheelSchema.refine(
    (wheel) => wheel.results.length === 0,
    'Shared links must not contain history.',
  ),
})
const maxLength = 16000

export function createShareLink(wheel: Wheel): string {
  const json = JSON.stringify({
    version: 1,
    wheel: {
      title: wheel.title,
      no_repeat: wheel.no_repeat,
      options: wheel.options,
      customization: wheel.customization,
      results: [],
    },
  })
  const bytes = new TextEncoder().encode(json)
  if (bytes.length > maxLength * 0.75)
    throw new Error(
      'This wheel is too large for a share link. Use Export JSON in My wheels to share its images and entries as a file.',
    )
  const encoded = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
  return `${location.origin}/#wheel=${encoded}`
}

export function readSharedWheel(fragment: string) {
  if (fragment.length > maxLength)
    throw new Error('This share link is too large. Import a JSON file instead.')
  const bytes = Uint8Array.from(atob(fragment.replaceAll('-', '+').replaceAll('_', '/')), (char) =>
    char.charCodeAt(0),
  )
  return shareSchema.parse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)))
    .wheel
}
