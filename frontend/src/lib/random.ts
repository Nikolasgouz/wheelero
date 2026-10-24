// Rejection sampling avoids the modulo bias of randomUint32 % count.
export function randomIndex(count: number): number {
  if (!Number.isInteger(count) || count < 1 || count > 200) throw new RangeError('count: 1–200')
  const limit = Math.floor(2 ** 32 / count) * count
  const value = new Uint32Array(1)
  do {
    crypto.getRandomValues(value)
  } while (value[0] >= limit)
  return value[0] % count
}

export function shuffled<T>(values: T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
