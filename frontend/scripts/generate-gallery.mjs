import sharp from 'sharp'
// Original geometric artwork, authored for Γύρνα. No external image sources.
const designs = {
  aurora: '<rect width="800" height="800" fill="#132b42"/><path d="M-100 600 Q200 -100 500 280T950 100" fill="none" stroke="#86efac" stroke-width="190"/><path d="M-100 800 Q200 100 500 480T950 300" fill="none" stroke="#c4b5fd" stroke-width="160"/>',
  sunset: '<rect width="800" height="800" fill="#f8c6b5"/><circle cx="400" cy="340" r="210" fill="#fde68a"/><path d="M0 450Q200 320 400 450T800 450V800H0" fill="#c4b5fd"/><path d="M0 610Q200 480 400 610T800 610V800H0" fill="#7650cc"/>',
  confetti: '<rect width="800" height="800" fill="#f8f7fc"/>' + Array.from({length:75}, (_,i) => `<rect x="${i*173%800}" y="${i*277%800}" width="35" height="65" rx="8" fill="${['#7650cc','#f6b38c','#6fae95','#d494bd'][i%4]}" transform="rotate(${i*37} ${i*173%800} ${i*277%800})"/>`).join(''),
}
for (const [name, shapes] of Object.entries(designs)) {
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">${shapes}</svg>`))
    .webp({quality:85}).toFile(`public/images/${name}.webp`)
}
