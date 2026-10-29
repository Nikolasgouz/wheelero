import el from './locales/el.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import pt from './locales/pt.json'
import nl from './locales/nl.json'
import pl from './locales/pl.json'
import tr from './locales/tr.json'
import ru from './locales/ru.json'
import ro from './locales/ro.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

export const languages = [
  { code: 'en', name: 'English', country: 'gb' },
  { code: 'el', name: 'Ελληνικά', country: 'gr' },
  { code: 'es', name: 'Español', country: 'es' },
  { code: 'fr', name: 'Français', country: 'fr' },
  { code: 'de', name: 'Deutsch', country: 'de' },
  { code: 'it', name: 'Italiano', country: 'it' },
  { code: 'pt', name: 'Português', country: 'pt' },
  { code: 'nl', name: 'Nederlands', country: 'nl' },
  { code: 'pl', name: 'Polski', country: 'pl' },
  { code: 'tr', name: 'Türkçe', country: 'tr' },
  { code: 'ru', name: 'Русский', country: 'ru' },
  { code: 'ro', name: 'Română', country: 'ro' },
  { code: 'ja', name: '日本語', country: 'jp' },
  { code: 'zh', name: '简体中文', country: 'cn' },
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
  ru,
  ro,
  ja,
  zh,
}
const saved = typeof window === 'undefined' ? null : localStorage.getItem('spinaro-language')
const browserLanguages = typeof window === 'undefined' ? [] : navigator.languages
let language: Language =
  languages.find(({ code }) => code === saved)?.code ??
  browserLanguages
    .map((locale) => languages.find(({ code }) => code === locale.split('-')[0].toLowerCase()))
    .find((match) => match)?.code ??
  'en'
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

// English is the source language. Translate public copy; preserve user-entered wheel data.
export function translate(text: string): string {
  return catalogs[language][text] ?? text
}

export function translateCount(count: number, singular: string, plural: string): string {
  const rule = new Intl.PluralRules(language).select(count)
  const key =
    rule === 'one'
      ? singular
      : ['pl', 'ru', 'ro'].includes(language) && rule === 'few'
        ? `${plural}.few`
        : plural
  return `${count} ${translate(key)}`
}
