import { shuffled } from './random'

export function generateTeams(names: string[], count: number): string[][] {
  if (
    names.length < 2 ||
    names.length > 10000 ||
    !Number.isInteger(count) ||
    count < 2 ||
    count > names.length
  )
    throw new RangeError('Choose 2 to one team per participant.')
  const teams: string[][] = Array.from({ length: count }, () => [])
  shuffled(names).forEach((name, index) => teams[index % count].push(name))
  return teams
}
