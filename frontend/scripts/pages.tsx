import { loadEnv } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { PageLoading } from '../src/components/PageLoading'
import { pages, publicPath, type SitePath } from '../src/site'

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function generatePages() {
  const environment = { ...loadEnv('production', '..', ''), ...process.env }
  const contactFormId = environment.VITE_CONTACT_FORM_ID ?? ''
  if (contactFormId && !/^[a-zA-Z0-9]{6,64}$/.test(contactFormId))
    throw new Error('VITE_CONTACT_FORM_ID must be a Formspree form ID, not an email or URL.')
  const origin = environment.PUBLIC_URL?.replace(/\/$/, '') ?? ''
  const indexable = environment.PUBLIC_INDEXING === 'true'
  if (indexable && !origin) throw new Error('PUBLIC_URL is required for an indexable build.')
  if (origin && new URL(origin).origin !== origin)
    throw new Error('PUBLIC_URL must be an HTTP(S) origin without a path.')
  const shell = await readFile('dist/index.html', 'utf8')
  for (const [path, page] of Object.entries(pages)) {
    const content = renderToStaticMarkup(
      <PageLoading path={path as SitePath} contactFormId={contactFormId} />,
    )
    const url = `${origin}${publicPath(path as SitePath)}`
    const meta = `<meta name="robots" content="${indexable && path !== '/404' ? 'index,follow' : 'noindex,nofollow'}" />
${path === '/404' ? '' : `<link rel="canonical" href="${escapeHtml(url)}" />`}
<meta property="og:type" content="website" /><meta property="og:site_name" content="Wheelero" />
<meta property="og:title" content="${escapeHtml(page.title)}" /><meta property="og:description" content="${escapeHtml(page.description)}" />
<meta property="og:url" content="${escapeHtml(url)}" /><meta property="og:image" content="${origin}/social.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Wheelero. One spin, one decision." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(page.title)}" /><meta name="twitter:description" content="${escapeHtml(page.description)}" />
<meta name="twitter:image" content="${origin}/social.png" /><meta name="twitter:image:alt" content="Wheelero. One spin, one decision." />`
    const structured =
      path === '/404'
        ? ''
        : `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org',
            '@type': page.kind === 'information' ? 'WebPage' : 'WebApplication',
            name: page.heading,
            description: page.description,
            url,
            ...(page.kind !== 'information'
              ? {
                  applicationCategory: 'UtilitiesApplication',
                  operatingSystem: 'Web browser',
                  browserRequirements: 'Requires JavaScript and a modern browser with Web Crypto.',
                }
              : {}),
          }).replaceAll('<', '\\u003c')}</script>`
    const html = shell
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
      .replace(
        /<meta name="description"[^>]+>/,
        `<meta name="description" content="${escapeHtml(page.description)}" />`,
      )
      .replace('</head>', `${meta}${structured}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`
    if (path !== '/') await mkdir(`dist${path}`, { recursive: true })
    await writeFile(file, html)
    if (path === '/404') await writeFile('dist/404.html', html)
    if (path === '/')
      await writeFile(
        'dist/launch.html',
        html.replace('content="index,follow"', 'content="noindex,follow"'),
      )
  }
  await writeFile(
    'dist/robots.txt',
    indexable
      ? `User-agent: *\nAllow: /\nDisallow: /launch.html\nSitemap: ${origin}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n',
  )
  await writeFile(
    'dist/sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      (origin
        ? Object.keys(pages)
            .filter((path) => path !== '/404')
            .map((path) => `<url><loc>${origin}${publicPath(path as SitePath)}</loc></url>`)
            .join('')
        : '') +
      '</urlset>',
  )
}
