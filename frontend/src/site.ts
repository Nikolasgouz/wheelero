export const pages = {
  '/': {
    title: 'Wheelero – Random Name Picker & Spin the Wheel',
    heading: 'Spin the Wheel to Pick a Random Name',
    description:
      'Pick a random name with a customizable wheel. Paste a list, spin, save your wheels and use Wheelero offline. No account needed.',
    intro:
      'One spin, one decision. Add your entries, make the wheel your own and let chance choose. Your lists stay on this device. Share a copy by link or JSON file.',
    kind: 'wheel',
  },
  '/random-name-picker': {
    title: 'Random Name Picker – Paste a List & Pick a Winner | Wheelero',
    heading: 'Random Name Picker',
    description:
      'Paste names from a list or spreadsheet, pick a random winner and remove winners without losing your original entries.',
    intro:
      'Start with an empty name list. Paste one name per line or cells copied from Excel, then spin. Use No repeats for a round where everyone gets one turn.',
    kind: 'wheel',
  },
  '/yes-no-wheel': {
    title: 'Yes or No Wheel – A Simple Random Decision | Wheelero',
    heading: 'Yes or No Wheel',
    description:
      'Spin a two-choice wheel for an equal-chance yes or no. Change the labels or customize its colors and sound.',
    intro:
      'Two choices, one equal chance each. This wheel starts with Yes and No. Use it for lighthearted decisions; it cannot judge which choice is best for you.',
    kind: 'wheel',
  },
  '/random-number-wheel': {
    title: 'Random Number Wheel – Choose Your Range | Wheelero',
    heading: 'Random Number Wheel',
    description:
      'Generate a wheel of whole numbers from your chosen range and spin to pick one with equal probability.',
    intro:
      'Choose a minimum and maximum whole number. Each number appears once and has the same chance. Generate up to 10,000 numbers; large wheels show a readable selection of labels.',
    kind: 'wheel',
  },
  '/random-team-generator': {
    title: 'Random Team Generator – Split Names into Balanced Teams | Wheelero',
    heading: 'Random Team Generator',
    description:
      'Paste a list of names and randomly split it into balanced teams. Generate and export teams locally without uploading names.',
    intro:
      'Choose the number of teams and shuffle everyone into groups. Team sizes differ by at most one person. Each row is a separate participant, even when names match.',
    kind: 'teams',
  },
  '/about': {
    title: 'About Wheelero – One spin, one decision.',
    heading: 'About Wheelero',
    description:
      'Learn how Wheelero helps you choose names, numbers and teams using browser randomness and local storage.',
    intro:
      'Wheelero turns everyday choices into a simple shared moment: one spin, one decision. Use it for classroom turns, games, group activities and small decisions.',
    kind: 'information',
  },
  '/privacy': {
    title: 'Privacy – How Wheelero Handles Your Data',
    heading: 'Privacy at Wheelero',
    description:
      'How Wheelero stores wheels in your browser, shares copies without uploads and lets you manage local data.',
    intro:
      'Your names, entries, wheel settings and results stay in this browser by default. Wheelero has no advertising, third-party analytics or tracking scripts.',
    kind: 'information',
  },
  '/404': {
    title: 'Page Not Found | Wheelero',
    heading: 'That page could not be found',
    description: 'Return to the Wheelero wheel or choose another tool.',
    intro:
      'This address does not match a Wheelero page. Your saved wheels are still on this device.',
    kind: 'information',
  },
} as const
export type SitePath = keyof typeof pages
export const currentPath = (path: string): SitePath =>
  path === '/launch.html' ? '/' : path in pages ? (path as SitePath) : '/404'
export const toolLinks = [
  ['/', 'Spin the wheel'],
  ['/random-name-picker', 'Name picker'],
  ['/yes-no-wheel', 'Yes / No'],
  ['/random-number-wheel', 'Number wheel'],
  ['/random-team-generator', 'Team generator'],
] as const
export const faq = [
  [
    'How do I add a list from Excel?',
    'Open More options, choose Add multiple entries, paste your cells and press Add these entries. Each non-empty line or tab-separated cell becomes one entry. Duplicate names remain separate chances unless you remove them.',
  ],
  [
    'How is the winner selected?',
    'The browser uses Web Crypto with rejection sampling to give every active entry an equal chance. The wheel animation lands on the selected entry. Colors, sound and duration never change the probabilities. There are no hidden weights.',
  ],
  [
    'Can I restore a removed winner?',
    'Choose Restore entries in the editor. This restores winners removed on this device and resets No repeats. Clearing the entire entries list also clears its removal history.',
  ],
  [
    'Can I use Wheelero offline?',
    'Yes, after the app reports Ready to use offline. The wheel, templates, local tools and saved settings work without a connection. Links are created locally; recipients need internet for their first visit.',
  ],
  [
    'How do I install it?',
    'Use Install when your browser offers it. On iPhone or iPad, open Wheelero in Safari, use Share, then Add to Home Screen. On desktop, use the browser install icon or menu. This installs a PWA, not an App Store or Google Play app.',
  ],
  [
    'What does a shared link reveal?',
    'The link itself contains a copy of your title, entries, images and customization. History and other wheels are excluded. No upload is made. Anyone with the link can read it, and it cannot be revoked. Use JSON export for wheels too large for a link.',
  ],
] as const
export const information = {
  '/about': [
    [
      'Made for everyday choices',
      'The wheel supports editable lists, images, themes, optional sound, no-repeat rounds, result history, backups and a presentation view. Number and team tools use the same browser cryptographic randomness.',
    ],
    [
      'A tool, not a guarantee',
      'Every active entry has equal probability. Adding the same name twice gives it two entries. Wheelero is not a certified gambling, audit or high-stakes decision system.',
    ],
    [
      'Install without a store',
      'Wheelero is a Progressive Web App for supported mobile and desktop browsers. The website and installed version share the same features. No account is required.',
    ],
    [
      'Publication details',
      'This preview does not list a company or contact address. The operator must add their identity and a real contact method before a permanent public launch.',
    ],
  ],
  '/privacy': [
    [
      'Local browser storage',
      'IndexedDB stores wheels, images, settings, results and removal history on this device. Local storage holds small preferences such as language, theme and sound, plus editor drafts. No names or wheel data are sent to an application backend. Clearing site data removes these records; export JSON backups first.',
    ],
    [
      'Offline files',
      'The service worker caches application files, fonts, bundled images and sounds. It supports offline use after the first complete download. Browser storage capacity and retention depend on your browser, device and available disk space.',
    ],
    [
      'Sharing without a server',
      'A share link embeds a copy of the selected wheel in its URL fragment, after #. The fragment is not part of the HTTP request to the host, but anyone you give the full link to can read and copy it. The link is not encrypted and cannot be revoked. Results and other wheels are excluded. Large wheels can be exported as JSON files.',
    ],
    [
      'Existing installations',
      'An older IndexedDB record is migrated locally and retained as a recovery copy. Old server links and server sync are no longer used. Previously uploaded records are not automatically erased from historical server databases; this website makes no requests to those databases.',
    ],
    [
      'Hosting and network requests',
      'Loading the website sends normal network information such as IP address and user agent to the hosting provider. The production website uses GitHub Pages; temporary previews may use Cloudflare Tunnel. There are no third-party trackers or application session cookies. Hosting providers may keep operational logs.',
    ],
    [
      'Before permanent publication',
      'The operator must add their identity, a real privacy contact and final hosting/provider details before permanent publication. These details have not been supplied. No company or legal certification is claimed.',
    ],
  ],
} as const
