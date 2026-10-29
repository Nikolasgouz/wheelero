// Rejection sampling and a sparse Fisher–Yates shuffle keep large ranges unbiased
// without allocating an array containing every possible integer.
export function generateNumbers(
  min: number,
  max: number,
  count: number,
  repeats: boolean,
): number[] {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < -1e9 || max > 1e9 || min > max)
    throw new RangeError(
      'Use whole numbers from -1,000,000,000 to 1,000,000,000, with Minimum no greater than Maximum.',
    )
  if (!Number.isInteger(count) || count < 1 || count > 1000)
    throw new RangeError('Choose a quantity from 1 to 1,000.')
  const size = max - min + 1
  if (!repeats && count > size)
    throw new RangeError('There are not enough different numbers in this range.')
  const swaps = new Map<number, number>()
  const results: number[] = []
  const random = new Uint32Array(1)
  for (let i = 0; i < count; i++) {
    const remaining = repeats ? size : size - i
    const limit = Math.floor(2 ** 32 / remaining) * remaining
    do {
      crypto.getRandomValues(random)
    } while (random[0] >= limit)
    const index = random[0] % remaining
    results.push(min + (swaps.get(index) ?? index))
    if (!repeats) swaps.set(index, swaps.get(remaining - 1) ?? remaining - 1)
  }
  return results
}
