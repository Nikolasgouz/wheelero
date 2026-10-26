import el from './locales/el.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import pt from './locales/pt.json'
import nl from './locales/nl.json'
import pl from './locales/pl.json'
import tr from './locales/tr.json'

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'tr', name: 'Türkçe' },
] as const
export type Language = (typeof languages)[number]['code']

const catalogs: Record<Language, Record<string, string>> = {
  en: {},
  el,
  es,
  fr,
  de,
  it,
  pt,
  nl,
  pl,
  tr,
}
const saved = typeof window === 'undefined' ? null : localStorage.getItem('spinaro-language')
let language: Language = languages.find(({ code }) => code === saved)?.code ?? 'en'
const listeners = new Set<() => void>()

export const getLanguage = () => language
export function subscribeLanguage(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function setLanguage(next: Language) {
  localStorage.setItem('spinaro-language', next)
  language = next
  document.documentElement.lang = next
  for (const listener of listeners) listener()
}

// English is the source language; asset names and editorial copy may remain English.
export function translate(text: string): string {
  return catalogs[language][text] ?? text
}

export function translateCount(count: number, singular: string, plural: string): string {
  const rule = new Intl.PluralRules(language).select(count)
  const key =
    rule === 'one' ? singular : language === 'pl' && rule === 'few' ? `${plural}.few` : plural
  return `${count} ${translate(key)}`
}
