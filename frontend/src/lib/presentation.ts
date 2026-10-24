import type { Customization } from '../customization'
import type { Option } from '../types'

export function textColor(background: string): string {
  const channels = [1, 3, 5].map(
    (offset) => parseInt(background.slice(offset, offset + 2), 16) / 255,
  )
  const linear = channels.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 > 0.179
    ? '#161322'
    : '#ffffff'
}

// Display projection only: never passed to the RNG or API. Preserve the winning ID.
export function presentationOptions(
  options: Option[],
  config: Customization,
  winnerId: string | null,
): Option[] {
  const seen = new Set<string>()
  const entries = config.show_duplicates
    ? options
    : options.filter((option) => {
        const key = JSON.stringify([option.label, option.image])
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  const visible = entries.slice(0, config.max_names)
  if (winnerId) {
    const winner = options.find((option) => option.id === winnerId)!
    if (!visible.some((option) => option.id === winnerId)) {
      const duplicate = config.show_duplicates
        ? -1
        : visible.findIndex(
            (option) => option.label === winner.label && option.image === winner.image,
          )
      visible[duplicate < 0 ? visible.length - 1 : duplicate] = winner
    }
  }
  return visible
}
