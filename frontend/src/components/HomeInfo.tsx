import { Palette, LayoutGrid, Repeat2, FileDown, Share2, WifiOff } from 'lucide-react'
import { t } from '../i18n'
import { getLanguage } from '../locale'

const featureIcons = [Palette, LayoutGrid, Repeat2, FileDown, Share2, WifiOff]

export function HomeInfo() {
  return (
    <div className="home-info" lang={getLanguage()}>
      <section aria-labelledby="about-title">
        <header className="info-heading">
          <p className="info-eyebrow">{t.about.eyebrow}</p>
          <h2 id="about-title">{t.about.title}</h2>
          <p>{t.about.intro}</p>
        </header>
        <div className="info-uses">
          {t.about.uses.map((use) => (
            <article key={use.title}>
              <h3>{use.title}</h3>
              <p>{use.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-how" aria-labelledby="how-title">
        <h2 id="how-title">{t.about.howTitle}</h2>
        <ol>
          {t.about.steps.map((step, index) => (
            <li key={step.title}>
              <span className="info-step" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="features-title" lang={getLanguage()}>
        <header className="info-heading">
          <h2 id="features-title">{t.about.featuresTitle}</h2>
          <p>{t.about.featuresIntro}</p>
        </header>
        <div className="info-features">
          {t.about.features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <article key={feature.title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            )
          })}
        </div>
      </section>
      <div className="info-notes">
        <section aria-labelledby="fairness-title">
          <h3 id="fairness-title">{t.about.fairnessTitle}</h3>
          <p>{t.about.fairness}</p>
        </section>
        <section aria-labelledby="privacy-title">
          <h3 id="privacy-title">{t.about.privacyTitle}</h3>
          <p>{t.about.privacy}</p>
        </section>
      </div>
    </div>
  )
}
