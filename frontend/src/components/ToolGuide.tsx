import { getLanguage, translate } from '../locale'
import { pages, publicPath, type SitePath } from '../site'
import { toolGuides, type ToolPath } from '../tool-content'

export function ToolGuide({ path }: { path: SitePath }) {
  if (!Object.hasOwn(toolGuides, path)) return null
  const guide = toolGuides[path as ToolPath]
  return (
    <div className="tool-guide" lang={getLanguage()}>
      <nav className="tool-links" aria-label={translate('Tools')}>
        {Object.keys(toolGuides).map((href) => (
          <a
            key={href}
            href={publicPath(href as ToolPath)}
            aria-current={href === path ? 'page' : undefined}
          >
            {translate(pages[href as ToolPath].heading)}
          </a>
        ))}
      </nav>
      <article className="site-details">
        {path === '/' && (
          <header>
            <h1>{translate(pages['/'].heading)}</h1>
            <p>{translate(pages['/'].intro)}</p>
          </header>
        )}
        <section>
          <h2>{translate('How it works')}</h2>
          <ol>
            {guide.steps.map((step) => (
              <li key={step}>{translate(step)}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2>{translate('Examples')}</h2>
          <p>{translate(guide.example)}</p>
        </section>
        <section>
          <h2>{translate('Help & FAQ')}</h2>
          {guide.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{translate(question)}</summary>
              <p>{translate(answer)}</p>
            </details>
          ))}
        </section>
        <section>
          <h2>{translate('Related tools')}</h2>
          <ul>
            {guide.related.map((href) => (
              <li key={href}>
                <a href={publicPath(href)}>{translate(pages[href].heading)}</a>
              </li>
            ))}
          </ul>
          {(path === '/random-number-wheel' || path === '/random-number-generator') && (
            <p>
              {translate(
                'Use the random number generator for instant batches or the number wheel for an animated reveal.',
              )}
            </p>
          )}
        </section>
      </article>
    </div>
  )
}
