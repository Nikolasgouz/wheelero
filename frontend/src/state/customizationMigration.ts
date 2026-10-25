import { z } from 'zod'
import { customizationSchema, imageSchema, type Customization } from '../customization'

// One-time migration for stored state and version 1 JSON backups.
export function upgradeCustomization(value: Record<string, unknown>): Customization {
  const migrated: Record<string, unknown> = { ...value, version: 2 }
  delete migrated.center_image
  delete migrated.center_size
  return customizationSchema.parse(migrated)
}

export const legacyCustomizationSchema = customizationSchema
  .extend({
    version: z.literal(1),
    center_image: imageSchema.nullable(),
    center_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  })
  .transform(upgradeCustomization)
