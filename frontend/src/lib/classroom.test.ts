import { describe, expect, it, vi } from 'vitest'
import { parseEntries } from './entries'
import { activeOptions, makeOptions, makeWheel, restartRound } from '../state/wheel'
import { backupWheelSchema } from '../types'
import { createShareLink, readSharedWheel } from './sharing'

describe('list import and classroom eligibility', () => {
  it('trims spreadsheet cells, ignores blanks and gives duplicate names distinct IDs', () => {
    const labels = parseEntries('  Alex \r\n\r\n Emma\t\n Alex  \n  ')
    expect(labels).toEqual(['Alex', 'Emma', 'Alex'])
    const options = makeOptions(labels)
    expect(new Set(options.map((o) => o.id)).size).toBe(3)
    expect(options.every((o) => o.active)).toBe(true)
  })

  it('excludes absent IDs independently of no-repeat and restores only round progress', () => {
    const wheel = makeWheel('Class', ['Alex', 'Alex', 'Emma'])
    wheel.classroom = { absent_ids: [wheel.options[0].id] }
    wheel.options[1].active = false
    expect(activeOptions(wheel).map((o) => o.id)).toEqual(wheel.options.slice(1).map((o) => o.id))
    wheel.no_repeat = true
    expect(activeOptions(wheel)).toEqual([wheel.options[2]])
    wheel.options[2].active = false
    expect(activeOptions(wheel)).toEqual([])
    const ids = wheel.options.map((o) => o.id)
    restartRound(wheel)
    expect(wheel.options.map((o) => o.id)).toEqual(ids)
    expect(wheel.classroom.absent_ids).toEqual([ids[0]])
    expect(activeOptions(wheel).map((o) => o.id)).toEqual(ids.slice(1))
    wheel.classroom.absent_ids = ids
    expect(activeOptions(wheel)).toEqual([])
  })

  it('preserves attendance in backups and accepts older wheels without classroom metadata', () => {
    const wheel = makeWheel('Class', ['Alex', 'Emma'])
    wheel.classroom = { absent_ids: [wheel.options[0].id] }
    expect(backupWheelSchema.parse(JSON.parse(JSON.stringify(wheel))).classroom).toEqual(
      wheel.classroom,
    )
    const legacy = { ...wheel, classroom: undefined }
    expect(backupWheelSchema.parse(legacy).classroom).toBeNull()
    expect(
      readSharedWheel(
        Buffer.from(JSON.stringify({ version: 1, wheel: legacy })).toString('base64url'),
      ).classroom,
    ).toBeNull()
    expect(
      backupWheelSchema.safeParse({ ...wheel, classroom: { absent_ids: [crypto.randomUUID()] } })
        .success,
    ).toBe(false)
    expect(
      backupWheelSchema.safeParse({
        ...wheel,
        classroom: { absent_ids: [wheel.options[0].id, wheel.options[0].id] },
      }).success,
    ).toBe(false)
  })

  it('shares the complete roster without attendance or round progress', () => {
    vi.stubGlobal('location', { origin: 'https://example.com' })
    const wheel = makeWheel('Class', ['Alex', 'Emma'])
    wheel.classroom = { absent_ids: [wheel.options[0].id] }
    wheel.no_repeat = true
    wheel.options[1].active = false
    const shared = readSharedWheel(createShareLink(wheel).split('#wheel=')[1])
    expect(shared.classroom).toEqual({ absent_ids: [] })
    expect(shared.options.map((o) => o.id)).toEqual(wheel.options.map((o) => o.id))
    expect(shared.options.every((o) => o.active)).toBe(true)
    expect(wheel.options[1].active).toBe(false)
    expect(wheel.classroom.absent_ids).toHaveLength(1)
    vi.unstubAllGlobals()
  })
})
