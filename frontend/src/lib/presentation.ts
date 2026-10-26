import type { Customization } from '../customization'
import type { Option } from '../types'

// Keep the chosen palette, then extend it instead of repeating sector colors.
// This sequence does not depend on count, so appending entries keeps existing colors.
export function sectorColors(count: number, palette: Customization['palette']): string[] {
  const colors = new Set(palette.filter((c) => c.enabled).map((c) => c.color.toLowerCase()))
  for (let step = 0; colors.size < count; step++) {
    const hue = (20 + step * 137.508) % 360
    const saturation = 0.78 + (step % 3) * 0.08
    const lightness = 0.52 + (step % 5) * 0.035
    const amplitude = saturation * Math.min(lightness, 1 - lightness)
    const hex = [0, 8, 4]
      .map((channel) => {
        const k = (channel + hue / 30) % 12
        const value = lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1))
        return Math.round(value * 255)
          .toString(16)
          .padStart(2, '0')
      })
      .join('')
    colors.add(`#${hex}`)
  }
  return [...colors].slice(0, count)
}

export function textColor(background: string): string {
  const channels = [1, 3, 5].map(
    (offset) => parseInt(background.slice(offset, offset + 2), 16) / 255,
  )
  const linear = channels.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 > 0.179
    ? '#000000'
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
