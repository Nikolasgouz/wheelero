export const colors = ['#ded2f6', '#f6d5c4', '#cbe5dc', '#f4e6b7', '#cddff2', '#edcfe1']

export function targetRotation(current: number, index: number, count: number): number {
  const angle = 360 - ((index + 0.5) * 360) / count
  return current + 5 * 360 + ((angle - (current % 360) + 360) % 360)
}

export function indexAtPointer(rotation: number, count: number): number {
  return Math.floor(((360 - (rotation % 360)) % 360) / (360 / count))
}

export function sectorPath(index: number, count: number): string {
  if (count === 1) return ''
  const start = (index * 2 * Math.PI) / count - Math.PI / 2
  const end = ((index + 1) * 2 * Math.PI) / count - Math.PI / 2
  return `M 200 200 L ${200 + 190 * Math.cos(start)} ${200 + 190 * Math.sin(start)} A 190 190 0 ${count === 2 ? 1 : 0} 1 ${200 + 190 * Math.cos(end)} ${200 + 190 * Math.sin(end)} Z`
}
