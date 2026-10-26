import { ct } from './customization.i18n'
import { z } from 'zod'

export const gallery = Object.entries(ct.images).map(([src, name]) => ({ src, name }))
export const imageSchema = z
  .string()
  .max(683000)
  .refine((value) => {
    if (gallery.some((image) => image.src === value)) return true
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
  gyrna: ['#8b5cf6', '#ff5b6e', '#14c8a2', '#ffbf24', '#32b5ff', '#ed62d4'],
  ocean: ['#164e63', '#0e7490', '#67e8f9', '#cffafe'],
  sunset: ['#7c3aed', '#e879a4', '#fb923c', '#fde68a'],
  forest: ['#14532d', '#4d7c0f', '#a3e635', '#ecfccb'],
  rainbow: ['#ef4444', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa'],
  candy: ['#f9a8d4', '#c4b5fd', '#a5f3fc', '#bbf7d0', '#fef08a', '#fed7aa'],
  tropical: ['#059669', '#2dd4bf', '#a3e635', '#fde047', '#fb923c', '#f472b6'],
  lavender: ['#5b21b6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#f5d0fe'],
  rose: ['#9f1239', '#e11d48', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'],
  midnight: ['#172554', '#1e3a8a', '#4338ca', '#6d28d9', '#a855f7', '#c084fc'],
  neon: ['#d9f99d', '#22d3ee', '#818cf8', '#e879f9', '#fb7185', '#fde047'],
  autumn: ['#7c2d12', '#c2410c', '#ea580c', '#f59e0b', '#fcd34d', '#a3a448'],
  ice: ['#155e75', '#0891b2', '#22d3ee', '#67e8f9', '#a5f3fc', '#e0f2fe'],
  earth: ['#78350f', '#a16207', '#b08968', '#d4a373', '#a3b18a', '#588157'],
  coral: ['#f97373', '#fb923c', '#fdba74', '#5eead4', '#14b8a6', '#0e7490'],
  retro: ['#e76f51', '#f4a261', '#e9c46a', '#a8c686', '#2a9d8f', '#264653'],
}
export const customizationSchema = z
  .object({
    version: z.literal(2),
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
  version: 2,
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
