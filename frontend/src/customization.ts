import { ct } from './customization.i18n'
import { z } from 'zod'

export const gallery = ['/images/aurora.webp', '/images/sunset.webp', '/images/confetti.webp']
export const imageSchema = z
  .string()
  .max(683000)
  .refine((value) => {
    if (gallery.includes(value)) return true
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return false
    const [header, encoded] = value.split(',')
    if (encoded.length % 4 !== 0) return false
    const bytes = atob(encoded)
    if (bytes.length > 512000) return false
    return header === 'data:image/png;base64'
      ? bytes.startsWith('\x89PNG\r\n\x1a\n')
      : header === 'data:image/jpeg;base64'
        ? bytes.startsWith('\xff\xd8\xff')
        : bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP'
  })
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/)
export const palettes = {
  gyrna: ['#ded2f6', '#f6d5c4', '#cbe5dc', '#f4e6b7', '#cddff2', '#edcfe1'],
  ocean: ['#164e63', '#0e7490', '#67e8f9', '#cffafe'],
  sunset: ['#7c3aed', '#e879a4', '#fb923c', '#fde68a'],
  forest: ['#14532d', '#4d7c0f', '#a3e635', '#ecfccb'],
}
export const customizationSchema = z
  .object({
    version: z.literal(1),
    spin_sound: z.enum([
      'none',
      'ticking',
      'drum',
      'pulse',
      'woodblock',
      'shaker',
      'heartbeat',
      'arpeggio',
      'space',
    ]),
    spin_volume: z.number().int().min(0).max(100),
    show_duplicates: z.boolean(),
    slow_spin: z.boolean(),
    show_title: z.boolean(),
    duration: z.number().int().min(1).max(60),
    max_names: z.number().int().min(4).max(1000),
    result_sound: z.enum([
      'none',
      'applause',
      'chime',
      'fanfare',
      'victory',
      'magic',
      'bell',
      'arcade',
      'gong',
    ]),
    result_volume: z.number().int().min(0).max(100),
    animate_winner: z.boolean(),
    confetti: z.boolean(),
    auto_remove: z.boolean(),
    popup: z.boolean(),
    popup_message: z.string().min(1).max(200),
    remove_button: z.boolean(),
    removal_sound: z.boolean(),
    mode: z.enum(['colors', 'image']),
    palette: z
      .array(z.object({ color, enabled: z.boolean() }))
      .min(1)
      .max(12)
      .refine((values) => values.some((v) => v.enabled)),
    center_image: imageSchema.nullable(),
    center_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    wheel_image: imageSchema.nullable(),
    pointer_changes: z.boolean(),
    pointer_color: color,
    page_color: color,
    gradient: z.boolean(),
    text: z.enum(['always', 'never', 'unless_image']),
    borders: z.boolean(),
    shadow: z.boolean(),
  })
  .strict()
export type Customization = z.infer<typeof customizationSchema>
export const defaults: Customization = {
  version: 1,
  spin_sound: 'ticking',
  spin_volume: 50,
  show_duplicates: true,
  slow_spin: false,
  show_title: true,
  duration: 10,
  max_names: 1000,
  result_sound: 'applause',
  result_volume: 50,
  animate_winner: false,
  confetti: true,
  auto_remove: false,
  popup: true,
  popup_message: 'And The Winner is...',
  remove_button: true,
  removal_sound: false,
  mode: 'colors',
  palette: palettes.gyrna.map((color) => ({ color, enabled: true })),
  center_image: null,
  center_size: 'S',
  wheel_image: null,
  pointer_changes: true,
  pointer_color: '#7650cc',
  page_color: '#f8f7fc',
  gradient: true,
  text: 'always',
  borders: false,
  shadow: true,
}

// Reduce large uploads before embedding them in the private, portable wheel snapshot.
export async function readImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10_000_000)
    throw new Error(ct.badImage)
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height))
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const data = canvas.toDataURL('image/webp', 0.8)
  if (data.length > 683000) throw new Error(ct.bigImage)
  return data
}
