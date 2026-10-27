import { Palette, FolderHeart, Repeat2, FileDown, Share2, WifiOff } from 'lucide-react'
import { t } from '../i18n'
import { translate } from '../locale'

const featureIcons = [Palette, FolderHeart, Repeat2, FileDown, Share2, WifiOff]

export function HomeInfo() {
  return (
    <div className="home-info">
      <section aria-labelledby="about-title">
        <header className="info-heading">
          <p className="info-eyebrow">{translate(t.about.eyebrow)}</p>
          <h2 id="about-title">{translate(t.about.title)}</h2>
          <p>{translate(t.about.intro)}</p>
        </header>
        <div className="info-uses">
          {t.about.uses.map((use) => (
            <article key={use.title}>
              <h3>{translate(use.title)}</h3>
              <p>{translate(use.text)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="info-how" aria-labelledby="how-title">
        <h2 id="how-title">{translate(t.about.howTitle)}</h2>
        <ol>
          {t.about.steps.map((step, index) => (
            <li key={step.title}>
              <span className="info-step" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{translate(step.title)}</h3>
              <p>{translate(step.text)}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="features-title">
        <header className="info-heading">
          <h2 id="features-title">{translate(t.about.featuresTitle)}</h2>
          <p>{translate(t.about.featuresIntro)}</p>
        </header>
        <div className="info-features">
          {t.about.features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <article key={feature.title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{translate(feature.title)}</h3>
                <p>{translate(feature.text)}</p>
              </article>
            )
          })}
        </div>
      </section>
      <div className="info-notes">
        <section aria-labelledby="fairness-title">
          <h3 id="fairness-title">{translate(t.about.fairnessTitle)}</h3>
          <p>{translate(t.about.fairness)}</p>
        </section>
        <section aria-labelledby="privacy-title">
          <h3 id="privacy-title">{translate(t.about.privacyTitle)}</h3>
          <p>{translate(t.about.privacy)}</p>
        </section>
      </div>
    </div>
  )
}
