import type { Template } from '../types'
// Bundled examples remain available before the first successful API connection.
export const templates: Template[] = [
  {
    id: 'names',
    title: 'Pick a name',
    emoji: '👋',
    category: 'Everyone gets a chance',
    options: ['Alex', 'Emma', 'James', 'Olivia', 'Noah', 'Sofia'],
  },
  {
    id: 'food',
    title: 'What should we eat?',
    emoji: '🍜',
    category: 'Something delicious',
    options: ['Pizza 🍕', 'Souvlaki 🥙', 'Pasta 🍝', 'Salad 🥗', 'Sushi 🍣', 'Burger 🍔'],
  },
  {
    id: 'plans',
    title: 'What should we do tonight?',
    emoji: '✨',
    category: 'With friends',
    options: ['Cinema 🎬', 'Board games 🎲', 'A walk 🌙', 'Drinks 🍹', 'Stay home 🛋️'],
  },
  {
    id: 'yes',
    title: 'Yes or no?',
    emoji: '🤔',
    category: 'The big question',
    options: ['Yes', 'No'],
  },
  {
    id: 'first',
    title: 'Who goes first?',
    emoji: '🎲',
    category: 'Game time',
    options: ['Anna', 'Nikos', 'Maria', 'John'],
  },
]
