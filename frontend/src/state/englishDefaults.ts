import type { LegacyWheel } from './storage'

// Frozen translation of the original bundled examples, used by the v6 data migration.
const examples: Record<string, { title: string; labels: Record<string, string> }> = {
  'Τι θα φάμε;': {
    title: 'What should we eat?',
    labels: {
      'Πίτσα 🍕': 'Pizza 🍕',
      'Σουβλάκι 🥙': 'Souvlaki 🥙',
      'Μακαρόνια 🍝': 'Pasta 🍝',
      'Σαλάτα 🥗': 'Salad 🥗',
    },
  },
  'Τι κάνουμε απόψε;': {
    title: 'What should we do tonight?',
    labels: {
      'Σινεμά 🎬': 'Cinema 🎬',
      'Επιτραπέζια 🎲': 'Board games 🎲',
      'Μια βόλτα 🌙': 'A walk 🌙',
      'Ποτό 🍹': 'Drinks 🍹',
      'Σπίτι 🛋️': 'Stay home 🛋️',
    },
  },
  'Ναι ή όχι;': { title: 'Yes or no?', labels: { Ναι: 'Yes', Όχι: 'No' } },
  'Ποιος ξεκινάει;': {
    title: 'Who goes first?',
    labels: {
      Άννα: 'Anna',
      Νίκος: 'Nikos',
      Μαρία: 'Maria',
      Γιάννης: 'John',
    },
  },
  'Ο νέος μου τροχός': { title: 'My new wheel', labels: {} },
}

export function translateEnglishDefaults(wheel: LegacyWheel) {
  const [title, ...suffixes] = wheel.title.split(' · ')
  if (suffixes.some((suffix) => suffix !== 'Αντίγραφο' && suffix !== 'Copy')) return
  const example = Object.hasOwn(examples, title) ? examples[title] : undefined
  const translated = [example?.title ?? title, ...suffixes.map(() => 'Copy')].join(' · ')
  let changed = translated !== wheel.title
  wheel.title = translated
  if (example) {
    for (const entry of [...wheel.options, ...wheel.results]) {
      const label = Object.hasOwn(example.labels, entry.label)
        ? example.labels[entry.label]
        : entry.label
      changed ||= label !== entry.label
      entry.label = label
    }
  }
  if (changed && wheel.dirty) wheel.mutation_id = crypto.randomUUID()
}
