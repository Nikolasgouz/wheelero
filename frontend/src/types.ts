import { z } from 'zod'

export const optionSchema = z.object({
  id: z.uuid(),
  label: z
    .string()
    .min(1)
    .max(160)
    .refine((v) => v.trim().length > 0),
  active: z.boolean(),
})
export const resultSchema = z
  .object({
    id: z.uuid(),
    option_id: z.uuid(),
    label: z.string().min(1).max(160),
    choice_index: z.number().int().min(0),
    choice_count: z.number().int().min(1).max(200),
    source: z.enum(['server', 'offline']),
    created_at: z.iso.datetime({ offset: true }),
  })
  .refine((r) => r.choice_index < r.choice_count)
export const backupWheelSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(120)
      .refine((v) => v.trim().length > 0),
    no_repeat: z.boolean(),
    options: z.array(optionSchema).max(200),
    results: z.array(resultSchema).max(10000),
  })
  .refine((w) => new Set(w.options.map((o) => o.id)).size === w.options.length)
export const backupSchema = z.object({
  format: z.literal('gyrna'),
  version: z.literal(1),
  wheels: z.array(backupWheelSchema).min(1).max(100),
})
export type Option = z.infer<typeof optionSchema>
export type DrawResult = z.infer<typeof resultSchema>
export type Wheel = z.infer<typeof backupWheelSchema> & {
  id: string
  revision: number
  deleted: boolean
  updated_at: string
}
export type LocalWheel = Wheel & { dirty: boolean; mutation_id: string; pending_results: string[] }
export type Template = {
  id: string
  title: string
  emoji: string
  category: string
  options: string[]
}
export type PendingDraw = { wheel_id: string; id: string; revision: number; options: Option[] }
export type SavedState = {
  version: 1
  wheels: LocalWheel[]
  active: string
  pending_draw: PendingDraw | null
  workspace_id: string
}
export type Share = { token: string; created_at: string }
