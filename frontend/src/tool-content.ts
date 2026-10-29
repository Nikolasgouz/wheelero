import { information, type SitePath } from './site'

const entries = information['/how-to-use'][0][1]
const spin =
  'Click the center. The winner appears when the wheel stops. Choose Close or Remove winner.'
const rounds = information['/how-to-use'][6]
const fairness = information['/how-to-use'][4]

export const toolGuides = {
  '/random-name-picker': {
    steps: [
      entries,
      spin,
      'For a round without repeat winners, open More options and enable No repeats. Use New round to make all entries eligible again.',
    ],
    example:
      'For a classroom name picker, paste the students taking part today. Save the class list for next time, or use the same flow to pick a random winner at a party.',
    faq: [
      rounds,
      [
        'What if two people have the same name?',
        'Duplicate names are separate entries. Add a surname or initial so you can tell people apart.',
      ],
    ],
    related: ['/random-team-generator', '/', '/random-number-generator'],
  },
  '/yes-no-wheel': {
    steps: [
      'Start with one Yes and one No entry. Click the center to choose. Edit Entries if you want different answers.',
      spin,
    ],
    example:
      'Try a yes or no spinner for a game or a low-stakes choice, such as whether to take a break. Each spin is independent when No repeats is off.',
    faq: [
      [
        'Are Yes and No equally likely?',
        'With one active entry for each answer, both have a 50% chance. Adding duplicates or excluding an entry changes those chances.',
      ],
      fairness,
    ],
    related: ['/', '/random-number-wheel', '/random-name-picker'],
  },
  '/random-number-wheel': {
    steps: [
      'Set Minimum and Maximum, then select Generate number wheel. Both limits are included, with up to 10,000 numbers.',
      spin,
      'For a round without repeat winners, open More options and enable No repeats. Use New round to make all entries eligible again.',
    ],
    example: 'numberWheel.example',
    faq: [
      [
        'Can I pick several numbers without spinning?',
        'Use the random number generator for instant batches or the number wheel for an animated reveal.',
      ],
      rounds,
    ],
    related: ['/random-number-generator', '/yes-no-wheel', '/'],
  },
  '/random-number-generator': {
    steps: [
      'Set Minimum, Maximum and Quantity. Enable Allow repeats if a number may appear more than once in the batch.',
      'Select Generate numbers, then Copy results. Each new batch is independent of earlier batches.',
    ],
    example:
      'Generate six unique numbers from 1 to 49, or allow repeats to simulate several dice rolls from 1 to 6. Negative numbers and a single-value range also work.',
    faq: [
      [
        'How many numbers can I generate?',
        'Choose up to 1,000 results per batch, between -1,000,000,000 and 1,000,000,000. Without repeats, the quantity cannot exceed the number of integers in the range.',
      ],
      [
        'How are the numbers selected?',
        'Web Crypto supplies random values. Rejection sampling avoids modulo bias, and unique batches sample without replacement. Results are generated on your device and are not sent to Analytics.',
      ],
    ],
    related: ['/random-number-wheel', '/random-team-generator', '/'],
  },
  '/random-team-generator': {
    steps: [
      'Paste Names, one per line, choose Number of teams and select Generate teams. Use Export teams to download a text file.',
    ],
    example:
      'Split 23 students into 5 classroom groups: three groups have 5 people and two have 4. You can also create pairs for practice or random teams for a game.',
    faq: [
      [
        'How are teams balanced?',
        'Names are shuffled randomly and distributed so group sizes differ by at most one. Skills, friendships and other characteristics are not considered.',
      ],
      [
        'What if two people have the same name?',
        'Duplicate names are separate entries. Add a surname or initial so you can tell people apart.',
      ],
    ],
    related: ['/random-name-picker', '/random-number-generator', '/'],
  },
} as const satisfies Partial<
  Record<
    SitePath,
    {
      steps: readonly string[]
      example: string
      faq: readonly (readonly [string, string])[]
      related: readonly SitePath[]
    }
  >
>
export type ToolPath = keyof typeof toolGuides
