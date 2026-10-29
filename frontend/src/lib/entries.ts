import type { Option } from '../types'

// Spreadsheet cells and ordinary lines are both entries. Preserve duplicates.
export function parseEntries(text: string): string[] {
  return text
    .split(/[\r\n\t]+/)
    .map((value) => value.trim())
    .filter(Boolean)
}

// Keep identity, images and no-repeat state when text is edited or reordered.
// The caret bounds the prefix so deleting one of two equal lines keeps the correct ID.
export function reconcileEntries(
  options: Option[],
  labels: string[],
  beforeCaret: number,
): Option[] {
  let start = 0
  while (start < beforeCaret && start < options.length && options[start].label === labels[start])
    start++
  let end = 0
  while (
    end < options.length - start &&
    end < labels.length - start &&
    options[options.length - 1 - end].label === labels[labels.length - 1 - end]
  )
    end++

  const middle = options.slice(start, options.length - end)
  const byLabel = new Map<string, Option[]>()
  for (let i = middle.length - 1; i >= 0; i--) {
    const option = middle[i]
    if (!byLabel.has(option.label)) byLabel.set(option.label, [])
    byLabel.get(option.label)!.push(option)
  }
  const changed = labels.slice(start, labels.length - end)
  const matches = changed.map((label) => byLabel.get(label)?.pop())
  const matchedIds = new Set(matches.map((option) => option?.id))
  const renamed = middle.filter((option) => !matchedIds.has(option.id))
  const canRename = renamed.length === matches.filter((option) => !option).length
  let renameIndex = 0
  return [
    ...options.slice(0, start),
    ...changed.map((label, i) => {
      const option = matches[i] ?? (canRename ? renamed[renameIndex++] : undefined)
      return option
        ? { ...option, label }
        : { id: crypto.randomUUID(), label, active: true, image: null }
    }),
    ...options.slice(options.length - end),
  ]
}
