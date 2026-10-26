import sharp from 'sharp'
for (const size of [192, 512, 180]) {
  await sharp('public/wheelero.svg')
    .resize(size, size)
    .png()
    .toFile(`public/wheelero-${size}.png`)
}
