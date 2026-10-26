import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const mark = Buffer.from(await readFile('public/wheelero.svg')).toString('base64')
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f8f7fc"/>
  <circle cx="1120" cy="80" r="320" fill="#efe8ff"/>
  <circle cx="1120" cy="80" r="220" fill="#ded1ff"/>
  <image href="data:image/svg+xml;base64,${mark}" x="88" y="112" width="156" height="156"/>
  <text x="280" y="218" font-family="Arial,sans-serif" font-size="92" font-weight="bold" fill="#302a3d">Wheelero</text>
  <text x="88" y="360" font-family="Arial,sans-serif" font-size="58" font-weight="bold" fill="#7650cc">One spin, one decision.</text>
  <text x="88" y="435" font-family="Arial,sans-serif" font-size="30" fill="#51465e">Names. Numbers. Teams. Your next choice.</text>
  <rect x="88" y="492" width="116" height="12" rx="6" fill="#7650cc"/>
  <rect x="216" y="492" width="64" height="12" rx="6" fill="#ff8b80"/>
</svg>`)).png().toFile('public/social.png')
