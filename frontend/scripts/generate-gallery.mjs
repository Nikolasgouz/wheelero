import sharp from 'sharp'
// Original geometric artwork, authored for Γύρνα. No external image sources.
const designs = {
  aurora: '<rect width="800" height="800" fill="#132b42"/><path d="M-100 600 Q200 -100 500 280T950 100" fill="none" stroke="#86efac" stroke-width="190"/><path d="M-100 800 Q200 100 500 480T950 300" fill="none" stroke="#c4b5fd" stroke-width="160"/>',
  sunset: '<rect width="800" height="800" fill="#f8c6b5"/><circle cx="400" cy="340" r="210" fill="#fde68a"/><path d="M0 450Q200 320 400 450T800 450V800H0" fill="#c4b5fd"/><path d="M0 610Q200 480 400 610T800 610V800H0" fill="#7650cc"/>',
  confetti: '<rect width="800" height="800" fill="#f8f7fc"/>' + Array.from({length:75}, (_,i) => `<rect x="${i*173%800}" y="${i*277%800}" width="35" height="65" rx="8" fill="${['#7650cc','#f6b38c','#6fae95','#d494bd'][i%4]}" transform="rotate(${i*37} ${i*173%800} ${i*277%800})"/>`).join(''),
  'ocean-waves': '<defs><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#164e63"/><stop offset="1" stop-color="#67e8f9"/></linearGradient></defs><rect width="800" height="800" fill="url(#sea)"/>' +
    Array.from({length:7}, (_,i) => `<path d="M-80 ${160+i*110} Q120 ${40+i*110} 320 ${160+i*110} T880 ${160+i*110}" fill="none" stroke="${['#cffafe','#22d3ee','#0891b2'][i%3]}" stroke-width="54" opacity=".7"/>`).join(''),
  'starry-night': '<rect width="800" height="800" fill="#172554"/><circle cx="530" cy="270" r="110" fill="#fef3c7"/><circle cx="575" cy="235" r="100" fill="#172554"/>' +
    Array.from({length:95}, (_,i) => `<circle cx="${(i*173+41)%800}" cy="${(i*277+19)%800}" r="${2+i%4}" fill="${i%3 ? '#c7d2fe' : '#fde68a'}"/>`).join(''),
  mountains: '<rect width="800" height="800" fill="#dbeafe"/><circle cx="570" cy="220" r="100" fill="#fde68a"/><path d="M-100 690L240 150L590 690Z" fill="#8da5c7"/><path d="M90 390L240 150L395 390L300 340L245 380L190 320Z" fill="#f8fafc"/><path d="M240 800L610 280L950 800Z" fill="#526c91"/><path d="M480 463L610 280L742 482L650 430L590 455L550 410Z" fill="#e2e8f0"/><path d="M0 690Q220 510 420 680T800 650V800H0Z" fill="#264653"/>',
  tropical: '<rect width="800" height="800" fill="#d1fae5"/>' +
    Array.from({length:12}, (_,i) => `<g transform="translate(${(i*197)%900-50} ${(i*257)%900-50}) rotate(${i*47})"><path d="M0 0C-190 -190 -80 -370 0 -410C80 -370 190 -190 0 0Z" fill="${['#047857','#059669','#34d399','#a3e635'][i%4]}"/><path d="M0 0V-380M0 -130L-60 -210M0 -190L65 -280" fill="none" stroke="#d1fae5" stroke-width="5" opacity=".7"/></g>`).join(''),
  candy: '<rect width="800" height="800" fill="#fce7f3"/>' +
    Array.from({length:12}, (_,i) => `<path d="M400 400C620 280 240 -40 400 -170L900 -170C760 120 660 360 400 400Z" fill="${['#f9a8d4','#c4b5fd','#a5f3fc','#fef08a'][i%4]}" transform="rotate(${i*30} 400 400)"/>`).join('') + '<circle cx="400" cy="400" r="65" fill="#fff1f2"/>',
  nebula: '<defs><radialGradient id="space"><stop stop-color="#f0abfc"/><stop offset=".35" stop-color="#9333ea"/><stop offset=".72" stop-color="#312e81"/><stop offset="1" stop-color="#0f172a"/></radialGradient></defs><rect width="800" height="800" fill="url(#space)"/><ellipse cx="400" cy="400" rx="330" ry="130" fill="none" stroke="#a5f3fc" stroke-width="10" opacity=".4" transform="rotate(-35 400 400)"/>' +
    Array.from({length:70}, (_,i) => `<circle cx="${(i*149+17)%800}" cy="${(i*251+73)%800}" r="${1+i%3}" fill="#f8fafc" opacity=".8"/>`).join(''),
  gold: '<defs><radialGradient id="gold"><stop stop-color="#fef3c7"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#92400e"/></radialGradient></defs><rect width="800" height="800" fill="url(#gold)"/>' +
    Array.from({length:24}, (_,i) => `<path d="M400 400L370 -200H430Z" fill="#fffbeb" opacity=".24" transform="rotate(${i*15} 400 400)"/>`).join('') + '<circle cx="400" cy="400" r="265" fill="none" stroke="#fef3c7" stroke-width="3" opacity=".7"/>',
  mosaic: '<rect width="800" height="800" fill="#f1f5f9"/>' +
    Array.from({length:64}, (_,i) => `<g transform="translate(${i%8*100} ${Math.floor(i/8)*100})"><rect width="100" height="100" fill="${['#2a9d8f','#e9c46a','#f4a261','#e76f51','#264653'][(i+Math.floor(i/8))%5]}"/><path d="M0 0L100 100H0Z" fill="#fff" opacity=".18"/></g>`).join(''),
  blossom: '<rect width="800" height="800" fill="#fff1f2"/><path d="M-70 770Q280 360 730 -50M270 420L720 400M440 220L100 70" fill="none" stroke="#9d6a72" stroke-width="16"/>' +
    Array.from({length:14}, (_,i) => `<g transform="translate(${(i*193+110)%760} ${(i*251+90)%760})">${Array.from({length:5}, (_,petal) => `<ellipse cy="-28" rx="22" ry="36" fill="${i%2 ? '#f9a8d4' : '#fda4af'}" transform="rotate(${petal*72})"/>`).join('')}<circle r="12" fill="#fde68a"/></g>`).join(''),
}
for (const [name, shapes] of Object.entries(designs)) {
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">${shapes}</svg>`))
    .webp({quality:85}).toFile(`public/images/${name}.webp`)
}
