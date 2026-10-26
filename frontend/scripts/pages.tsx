import { loadEnv } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { SiteDetails, SiteFooter, SiteIntro } from '../src/components/SiteContent'
import { pages, type SitePath } from '../src/site'

export async function generatePages() {
  const environment = { ...loadEnv('production', '..', ''), ...process.env }
  const origin = environment.PUBLIC_URL?.replace(/\/$/, '') ?? ''
  const indexable = environment.PUBLIC_INDEXING === 'true'
  if (indexable && !origin) throw new Error('PUBLIC_URL is required for an indexable build.')
  if (origin && new URL(origin).origin !== origin)
    throw new Error('PUBLIC_URL must be an HTTP(S) origin without a path.')
  const shell = await readFile('dist/index.html', 'utf8')
  for (const [path, page] of Object.entries(pages)) {
    const content = renderToStaticMarkup(
      <div className="app home">
        <header className="topbar">
          <a className="brand" href="/">
            <img className="brand-icon" src="/wheelero.svg" alt="" width="34" height="34" />
            Wheelero
          </a>
        </header>
        <main>
          <SiteIntro path={path as SitePath} />
          {page.kind !== 'information' && (
            <section className="site-details">
              <h2>How to use this tool</h2>
              <ol>
                <li>Add or paste your entries.</li>
                <li>Choose your settings and spin or generate teams.</li>
                <li>Save, export or start another round.</li>
              </ol>
              <p>
                The interactive tool uses JavaScript. Enable it to use the wheel. Names stay on this
                device.
              </p>
            </section>
          )}
          <SiteDetails path={path as SitePath} />
        </main>
        <SiteFooter />
      </div>,
    )
    const url = `${origin}${path === '/404' ? '/' : path}`
    const meta = `<meta name="robots" content="${indexable && path !== '/404' ? 'index,follow' : 'noindex,nofollow'}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" /><meta property="og:site_name" content="Wheelero" />
<meta property="og:title" content="${page.title}" /><meta property="og:description" content="${page.description}" />
<meta property="og:url" content="${url}" /><meta property="og:image" content="${origin}/social.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Wheelero. One spin, one decision." />
<meta name="twitter:card" content="summary_large_image" />`
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
      .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)
      .replace(
        /<meta name="description"[^>]+>/,
        `<meta name="description" content="${page.description}" />`,
      )
      .replace('</head>', `${meta}${structured}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`
    if (path !== '/') await mkdir(`dist${path}`, { recursive: true })
    await writeFile(file, html)
    if (path === '/404') await writeFile('dist/404.html', html)
    if (path === '/') await writeFile('dist/launch.html', html)
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
            .map((path) => `<url><loc>${origin}${path}</loc></url>`)
            .join('')
        : '') +
      '</urlset>',
  )
}
