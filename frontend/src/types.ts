import { z } from 'zod'
import { customizationSchema, defaults, imageSchema } from './customization'
import { legacyCustomizationSchema } from './state/customizationMigration'

export const optionSchema = z.object({
  id: z.uuid(),
  label: z
    .string()
    .min(1)
    .max(160)
    .refine((v) => v.trim().length > 0),
  active: z.boolean(),
  image: imageSchema.nullable().default(null),
})
export const resultSchema = z
  .object({
    id: z.uuid(),
    option_id: z.uuid(),
    label: z.string().min(1).max(160),
    choice_index: z.number().int().min(0),
    choice_count: z.number().int().min(1).max(10000),
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
    customization: z
      .union([customizationSchema, legacyCustomizationSchema])
      .default(() => structuredClone(defaults)),
    options: z.array(optionSchema).max(10000),
    results: z.array(resultSchema).max(10000),
  })
  .refine((w) => new Set(w.options.map((o) => o.id)).size === w.options.length)
  .refine((w) => new TextEncoder().encode(JSON.stringify(w)).length <= 8_000_000)
export const backupSchema = z.object({
  format: z.literal('gyrna'),
  version: z.literal(1),
  wheels: z.array(backupWheelSchema).min(1).max(100),
})
export type Option = z.infer<typeof optionSchema>
export type DrawResult = z.infer<typeof resultSchema>
export type Wheel = z.infer<typeof backupWheelSchema> & {
  id: string
  updated_at: string
}
export type LocalWheel = Wheel & { saved: boolean }
export type Template = {
  id: string
  title: string
  emoji: string
  category: string
  options: string[]
}
export type SavedState = {
  version: 1
  tool_wheels: Record<string, string>
  removed: { wheel_id: string; option: Option; position: number }[]
  wheels: LocalWheel[]
  active: string
  removals: {
    wheel_id: string
    option_id: string
    result_id: string
    due: number
    sound: boolean
    volume: number
  }[]
}
