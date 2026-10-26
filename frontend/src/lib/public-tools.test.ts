import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomIndex } from './random'
import { parseEntries } from './entries'
import { generateTeams } from './teams'
import { backupSchema } from '../types'
import { makeWheel } from '../state/wheel'
import { createShareLink, readSharedWheel } from './sharing'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('shares Unicode and settings in a fragment without history and rejects oversized or invalid data', () => {
  vi.stubGlobal('location', { origin: 'https://wheelero.example' })
  const wheel = makeWheel('Παρέα 🎉', ['Alex', 'Νίκος'])
  const link = new URL(createShareLink(wheel))
  expect(link.search).toBe('')
  const restored = readSharedWheel(link.hash.slice('#wheel='.length))
  expect(restored.options).toEqual(wheel.options)
  expect(restored.customization).toEqual(wheel.customization)
  expect(restored.results).toEqual([])
  expect(() => readSharedWheel('not-a-valid-payload')).toThrow()
  expect(() => readSharedWheel('x'.repeat(16001))).toThrow()
  wheel.options = Array.from({ length: 1000 }, () => ({
    ...wheel.options[0],
    id: crypto.randomUUID(),
  }))
  expect(() => createShareLink(wheel)).toThrow('Export JSON')
})

describe('browser random selection', () => {
  it('rejects the biased tail before mapping an index', () => {
    const values = [0xffffffff, 5]
    const random = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = values.shift()!
      return array
    })
    expect(randomIndex(3)).toBe(2)
    expect(random).toHaveBeenCalledTimes(2)
  })
  it('supports a single entry, validates bounds and reaches the last entry', () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 9999
      return array
    })
    expect(randomIndex(1)).toBe(0)
    expect(randomIndex(10000)).toBe(9999)
    for (const count of [0, -1, 1.5, 10001]) expect(() => randomIndex(count)).toThrow(RangeError)
  })
})
it('accepts spreadsheet cells, ignores blank cells and keeps duplicate names', () => {
  expect(parseEntries(' Alex\tEmma\r\n\r\n Alex\t\tΝίκος 🎲 ')).toEqual([
    'Alex',
    'Emma',
    'Alex',
    'Νίκος 🎲',
  ])
})
it('creates balanced teams without dropping duplicate participants', () => {
  const names = ['Alex', 'Alex', 'Emma', 'Noah', 'Sofia', 'Nikos', 'Jo']
  const teams = generateTeams(names, 3)
  expect(teams.map((team) => team.length)).toEqual([3, 2, 2])
  expect(teams.flat().sort()).toEqual([...names].sort())
  expect(names).toHaveLength(7)
  expect(() => generateTeams(names, 8)).toThrow(RangeError)
})
it('round-trips Unicode/configuration in backups and rejects malformed IDs and limits', () => {
  const wheel = makeWheel('Παρέα 🎲', ['Alex', 'Alex', '<script>alert(1)</script>'])
  wheel.customization.duration = 17
  const backup = { format: 'gyrna', version: 1, wheels: [wheel] }
  const restored = backupSchema.parse(JSON.parse(JSON.stringify(backup)))
  expect(restored.wheels[0].options).toEqual(wheel.options)
  expect(restored.wheels[0].customization.duration).toBe(17)
  wheel.options[1].id = wheel.options[0].id
  expect(backupSchema.safeParse(backup).success).toBe(false)
  expect(backupSchema.safeParse({ ...backup, version: 99 }).success).toBe(false)
})
