import { z } from 'zod'
import { pages, type SitePath } from '../site'

export const measurementId = 'G-JB9ZRMKRKR'
const count = z.number().int().min(0).max(10000)
export const analyticsEvent = z.discriminatedUnion('name', [
  z.object({ name: z.literal('page_view') }).strict(),
  z.object({ name: z.literal('wheel_spin_complete'), entry_count: count }).strict(),
  z.object({ name: z.literal('wheel_save'), entry_count: count }).strict(),
  z.object({ name: z.literal('wheel_share'), entry_count: count }).strict(),
  z.object({ name: z.literal('teams_generate'), entry_count: count, team_count: count }).strict(),
])
export const analyticsMessage = z
  .object({
    path: z.enum(Object.keys(pages) as [SitePath, ...SitePath[]]),
    debug: z.boolean(),
    event: analyticsEvent,
  })
  .strict()
export type AnalyticsEvent = z.infer<typeof analyticsEvent>
