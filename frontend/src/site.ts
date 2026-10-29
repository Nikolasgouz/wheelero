export const shareExplanation =
  'The link contains a copy of the title, entries, images and settings. Results and other wheels are excluded. Anyone with the link can read it. Links cannot be revoked. Large wheels may not fit.'

export const pages = {
  '/': {
    title: 'Wheelero – Random Name Picker & Spin the Wheel',
    heading: 'Spin the Wheel to Pick a Random Name',
    description:
      'Turn a list into a decision. Add names or choices, customise the wheel and click its center to pick a winner.',
    kind: 'wheel',
  },
  '/random-name-picker': {
    title: 'Random Name Picker – Paste a List & Pick a Winner | Wheelero',
    heading: 'Random Name Picker',
    description:
      'Paste names into Entries and spin. Use No repeats to give each entry one turn per round.',
    intro:
      'Paste names into Entries and spin. Use No repeats to give each entry one turn per round.',
    kind: 'wheel',
  },
  '/yes-no-wheel': {
    title: 'Yes or No Wheel – A Simple Random Decision | Wheelero',
    heading: 'Yes or No Wheel',
    description: 'Spin for Yes or No with equal chances, or edit the two choices.',
    intro: 'Spin for Yes or No with equal chances, or edit the two choices.',
    kind: 'wheel',
  },
  '/random-number-wheel': {
    title: 'Random Number Wheel – Choose Your Range | Wheelero',
    heading: 'Random Number Wheel',
    description:
      'Choose a whole-number range of up to 10,000 numbers. Generate the wheel and spin.',
    intro: 'Choose a whole-number range of up to 10,000 numbers. Generate the wheel and spin.',
    kind: 'wheel',
  },
  '/random-team-generator': {
    title: 'Random Team Generator – Split Names into Balanced Teams | Wheelero',
    heading: 'Random Team Generator',
    description:
      'Paste names and choose how many teams to make. Groups differ by at most one person. Export them as text.',
    intro:
      'Paste names and choose how many teams to make. Groups differ by at most one person. Export them as text.',
    kind: 'teams',
  },
  '/about': {
    title: 'About Wheelero – One spin, one decision.',
    heading: 'About Wheelero',
    description: 'A wheel for names, ideas and everyday choices. No account needed.',
    intro: 'A wheel for names, ideas and everyday choices. No account needed.',
    kind: 'information',
  },
  '/privacy': {
    title: 'Privacy – How Wheelero Handles Your Data',
    heading: 'Privacy Policy',
    description:
      'No account or cloud sync. Wheels stay in this browser. Clearing site data removes them.',
    intro: 'Learn how Wheelero stores your information and what happens when you share a wheel.',
    kind: 'information',
  },
  '/how-to-use': {
    title: 'Help & FAQ | Wheelero',
    heading: 'Help & FAQ',
    description: 'Get started, personalise your wheel and find answers to common questions.',
    intro: 'Get started, personalise your wheel and find answers to common questions.',
    kind: 'information',
  },
  '/contact': {
    title: 'Contact & Support | Wheelero',
    heading: 'Contact & support',
    description: 'Send a message for questions, feedback or technical support.',
    intro: 'Send a message for questions, feedback or technical support.',
    kind: 'information',
  },
  '/terms': {
    title: 'Terms of Use | Wheelero',
    heading: 'Terms of Use',
    description: 'Guidelines for using Wheelero.',
    intro: 'Guidelines for using Wheelero.',
    kind: 'information',
  },
  '/cookies': {
    title: 'Cookie Settings | Wheelero',
    heading: 'Cookie settings',
    description: 'Cookies and storage on this device.',
    intro: 'Understand how Wheelero uses browser storage and how to manage your data.',
    kind: 'information',
  },
  '/404': {
    title: 'Page Not Found | Wheelero',
    heading: 'That page could not be found',
    description: 'Return to the wheel',
    intro: 'This page does not exist. Return to the wheel to continue.',
    kind: 'information',
  },
} as const
export type SitePath = keyof typeof pages
export const currentPath = (path: string): SitePath =>
  path === '/launch.html' ? '/' : path in pages ? (path as SitePath) : '/404'
export const footerGroups = [
  {
    title: 'Help & information',
    links: [
      ['/how-to-use', 'Help & FAQ'],
      ['/about', 'About Wheelero'],
      ['/contact', 'Contact & support'],
    ],
  },
  {
    title: 'Privacy & terms',
    links: [
      ['/privacy', 'Privacy Policy'],
      ['/terms', 'Terms of Use'],
      ['/cookies', 'Cookie settings'],
    ],
  },
] as const satisfies readonly { title: string; links: readonly (readonly [SitePath, string])[] }[]
export const information = {
  '/about': [
    [
      'How it works',
      'Wheelero helps you choose names, organise teams and make everyday decisions. Add your entries, personalise the wheel and spin when you are ready.',
    ],
    ['Customise', 'Choose colors, images, sounds and spin duration.'],
    [
      'Offline use',
      'Spin offline when Wheelero reports it is ready. Install the app where your browser supports it.',
    ],
  ],
  '/how-to-use': [
    [
      'How do I add entries?',
      'Type or paste directly into Entries, one name per line. Blank lines are ignored. Duplicates stay separate.',
    ],
    ['Customise', 'Choose colors, images, sounds and spin duration.'],
    [
      'How does Save work?',
      'Save updates a wheel with the same name. A different name creates a copy. Open a saved wheel to edit a working draft.',
    ],
    ['Results', 'Review, sort, clear or export results as a text file.'],
    [
      'How is the winner selected?',
      'Each eligible entry has an equal chance. Duplicate names count separately. Appearance and sound never change the result.',
    ],
    [
      'Offline use',
      'Spin offline when Wheelero reports it is ready. Install the app where your browser supports it.',
    ],
    [
      'How do I start another round?',
      'No repeats excludes previous winners. New round brings them back. Restore entries in More options restores removed winners.',
    ],
    ['What does a shared link reveal?', shareExplanation],
    [
      'Install app',
      'Use Install app if offered. On iPhone or iPad, open Safari, tap Share and choose Add to Home Screen.',
    ],
  ],
  '/privacy': [
    [
      'Your wheels, on this device',
      'Entries, images, settings and results are stored in this browser. No lists are uploaded automatically. Clearing site data removes local wheels.',
    ],
    [
      'Offline files',
      'The app downloads files for offline use. Storage space and retention depend on your browser and device.',
    ],
    ['Share', shareExplanation],
    [
      'Hosting and network requests',
      'The host receives connection data such as your IP address. Optional Google Analytics starts only after you accept. You can reject it or change your choice in Cookie settings.',
    ],
    [
      'Managing stored data',
      'Delete saved wheels in Open. To remove all local data, use your browser settings for this site. This also removes names, results and preferences.',
    ],
  ],
  '/contact': [
    [
      'Report a problem',
      'Please include your browser, device and the steps that led to the issue. Explain what you expected and what happened instead. Leave out private names and shared wheel links.',
    ],
  ],
  '/terms': [
    [
      'Using Wheelero',
      'Use Wheelero lawfully and respect other people. Only enter or share content you are entitled to use.',
    ],
    [
      'Random results',
      'Wheelero is for everyday choices and games. A random result is not professional advice or a certified draw.',
    ],
    [
      'Your wheels, on this device',
      'You manage your lists and shared links. Browser storage can be cleared or lost. Wheelero does not provide cloud backup or account recovery.',
    ],
    ['Share', shareExplanation],
  ],
  '/cookies': [
    [
      'Cookie settings',
      'Your analytics choice is stored on this device. If you accept, Google Analytics uses _ga cookies for up to one year and receives page visits, feature counts and technical connection data. Rejecting stops collection and removes these cookies without deleting your wheels.',
    ],
    [
      'Local storage',
      'Names, wheels, images and results use IndexedDB. Language, preferences and drafts use localStorage. App files are cached for offline use.',
    ],
    [
      'Managing stored data',
      'Delete saved wheels in Open. To remove all local data, use your browser settings for this site. This also removes names, results and preferences.',
    ],
  ],
} as const
