import { showScreen } from './navigation'
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { SavedState, Wheel } from '../src/types'
import { readFile } from 'node:fs/promises'

test.use({ actionTimeout: 15000 })

async function ready(page: Page) {
  await page.goto('/')
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
}
async function state(page: Page): Promise<SavedState> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('gyrna')
      request.onsuccess = () => resolve(request.result)
    })
    const data = await new Promise<SavedState>((resolve) => {
      const request = db.transaction('state').objectStore('state').get('current')
      request.onsuccess = () => resolve(request.result)
    })
    db.close()
    return data
  })
}
async function customize(page: Page) {
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Προσαρμογή', exact: true }).click()
  return page.getByRole('dialog')
}
async function save(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Αποθήκευση', exact: true }).click()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
}

test('configuration and uploaded assets survive copy, JSON and public snapshot copying', async ({
  page,
  browser,
}) => {
  await ready(page)
  const dialog = await customize(page)
  await dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή').fill('7')
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.locator('input[type=file]').setInputFiles('public/images/sunset.webp')
  await expect(dialog.locator('.image-preview')).toHaveAttribute('src', /^data:image\/webp;base64,/)
  await save(page)
  const original = (await state(page)).wheels[0]
  await page.getByRole('button', { name: 'Οι τροχοί μου', exact: true }).first().click()
  await page.getByRole('button', { name: `Αντίγραφο: ${original.title}`, exact: true }).click()
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  const copied = (await state(page)).wheels[1]
  expect(copied.customization).toEqual(original.customization)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Εξαγωγή JSON' }).click()
  const download = await downloadEvent
  const path = (await download.path())!
  const archive = JSON.parse(await readFile(path, 'utf8'))
  expect(archive.wheels[0].customization).toEqual(original.customization)
  await page.locator('input[type=file]').setInputFiles(path)
  await expect(page.locator('.wheel-card')).toHaveCount(4)
  expect((await state(page)).wheels[2].customization).toEqual(original.customization)
  await page.getByRole('button', { name: 'Τροχός', exact: true }).first().click()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Κοινοποίηση', exact: true }).click()
  await page.getByRole('button', { name: 'Δημιουργία συνδέσμου' }).click()
  const link = page.getByRole('dialog').getByLabel('Κοινοποίηση', { exact: true })
  await expect(link).toBeVisible()
  const recipient = await browser.newContext()
  const other = await recipient.newPage()
  await other.goto(await link.inputValue())
  await other.getByRole('button', { name: 'Κράτησε δικό σου αντίγραφο', exact: true }).click()
  await expect(other.getByRole('dialog')).toHaveCount(0)
  const received = await state(other)
  expect(received.wheels.find((w) => w.id === received.active)!.customization).toEqual(
    original.customization,
  )
  await recipient.close()
})

test('legacy IndexedDB is upgraded with compatible defaults without losing entries', async ({
  page,
}) => {
  await page.route('**/legacy-seed', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html><body>Seed</body></html>' }),
  )
  await page.goto('/legacy-seed')
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('gyrna', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('state')
      request.onsuccess = () => resolve(request.result)
    })
    const id = crypto.randomUUID()
    const wheel = {
      id,
      title: 'Legacy',
      revision: 0,
      no_repeat: false,
      deleted: false,
      updated_at: new Date().toISOString(),
      options: ['One', 'Two'].map((label) => ({ id: crypto.randomUUID(), label, active: true })),
      results: [],
      dirty: true,
      mutation_id: crypto.randomUUID(),
      pending_results: [],
    }
    await new Promise<void>((resolve) => {
      const tx = db.transaction('state', 'readwrite')
      tx.objectStore('state').put(
        { wheels: [wheel], active: id, pending_draw: null, workspace_id: '' },
        'current',
      )
      tx.oncomplete = () => resolve()
    })
    db.close()
  })
  await ready(page)
  await expect(page.locator('.wheel-title')).toHaveText('Legacy')
  const migrated = await state(page)
  expect(migrated.wheels[0].options.map((o) => o.label)).toEqual(['One', 'Two'])
  expect(migrated.wheels[0].options[0].image).toBe(null)
  expect(migrated.wheels[0].customization.duration).toBe(10)
  expect(migrated.removals).toEqual([])
})

test('real audio graph respects preview stop, volume and global mute', async ({ page }) => {
  await page.addInitScript(() => {
    const observed = { starts: 0, stops: 0, volumes: [] as number[] }
    Object.assign(window, { observedAudio: observed })
    const start = AudioScheduledSourceNode.prototype.start
    AudioScheduledSourceNode.prototype.start = function (...args: Parameters<typeof start>) {
      observed.starts++
      return start.apply(this, args)
    }
    const bufferStart = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args: Parameters<typeof bufferStart>) {
      observed.starts++
      return bufferStart.apply(this, args)
    }
    const disconnect = AudioNode.prototype.disconnect as () => void
    AudioNode.prototype.disconnect = function () {
      observed.stops++
      disconnect.call(this)
    }
    const gain = AudioContext.prototype.createGain
    AudioContext.prototype.createGain = function () {
      const node = gain.call(this)
      const connect = node.connect.bind(node)
      node.connect = ((destination: AudioNode) => {
        if (destination === this.destination) observed.volumes.push(node.gain.value)
        return connect(destination)
      }) as typeof node.connect
      return node
    }
  })
  await ready(page)
  let dialog = await customize(page)
  await expect(dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true })).toBeDisabled()
  await dialog.getByRole('button', { name: 'Ακύρωση' }).click()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Ενεργοποίηση ήχου', exact: true }).click()
  dialog = await customize(page)
  await dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
      ),
    )
    .toBeGreaterThan(0)
  await dialog.getByRole('button', { name: 'Διακοπή', exact: true }).click()
  const stopped = await page.evaluate(
    () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
  )
  await page.waitForTimeout(300)
  expect(
    await page.evaluate(
      () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
    ),
  ).toBe(stopped)
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog.getByLabel('Ένταση αποτελέσματος — τιμή').fill('0')
  await dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true }).click()
  expect(
    await page.evaluate(
      () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
    ),
  ).toBe(stopped)
  await dialog.getByLabel('Ένταση αποτελέσματος — τιμή').fill('100')
  await dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true }).click()
  const observed = await page.evaluate(
    () =>
      (window as unknown as { observedAudio: { starts: number; volumes: number[]; stops: number } })
        .observedAudio,
  )
  expect(observed.starts).toBeGreaterThan(stopped)
  expect(observed.volumes.at(-1)).toBeCloseTo(0.35)
  expect(observed.stops).toBeGreaterThan(0)
  for (const choice of [
    'applause',
    'chime',
    'fanfare',
    'victory',
    'magic',
    'bell',
    'arcade',
    'gong',
  ]) {
    await dialog.getByLabel('Ήχος αποτελέσματος', { exact: true }).selectOption(choice)
    const before = await page.evaluate(
      () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
    )
    await dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true }).click()
    expect(
      await page.evaluate(
        () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
      ),
    ).toBeGreaterThan(before)
    await dialog.getByRole('button', { name: 'Διακοπή', exact: true }).click()
  }
  await dialog.getByRole('tab', { name: 'Κατά την περιστροφή' }).click()
  for (const choice of [
    'ticking',
    'drum',
    'pulse',
    'woodblock',
    'shaker',
    'heartbeat',
    'arpeggio',
    'space',
  ]) {
    await dialog.getByLabel('Ήχος περιστροφής', { exact: true }).selectOption(choice)
    const before = await page.evaluate(
      () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
    )
    await dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true }).click()
    expect(
      await page.evaluate(
        () => (window as unknown as { observedAudio: { starts: number } }).observedAudio.starts,
      ),
    ).toBeGreaterThan(before)
    await dialog.getByRole('button', { name: 'Διακοπή', exact: true }).click()
  }
  await dialog.getByLabel('Ήχος περιστροφής', { exact: true }).selectOption('none')
  await expect(dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true })).toBeDisabled()
  await dialog.getByLabel('Ήχος περιστροφής', { exact: true }).selectOption('arpeggio')
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog.getByLabel('Ήχος αποτελέσματος', { exact: true }).selectOption('magic')
  await save(page)
  await page.reload()
  dialog = await customize(page)
  await expect(dialog.getByLabel('Ήχος περιστροφής', { exact: true })).toHaveValue('arpeggio')
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await expect(dialog.getByLabel('Ήχος αποτελέσματος', { exact: true })).toHaveValue('magic')
  await expect(dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true })).toBeDisabled()
  await dialog.getByRole('button', { name: 'Ακύρωση' }).click()
  // Reload resets global sound to mute; toggle it on and back off explicitly.
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Ενεργοποίηση ήχου', exact: true }).click()
  await page.getByRole('button', { name: 'Απενεργοποίηση ήχου', exact: true }).click()
  dialog = await customize(page)
  await expect(dialog.getByRole('button', { name: 'Αναπαραγωγή', exact: true })).toBeDisabled()
})

test('transactional customization: defaults, cancel, every tab, persistence and backup', async ({
  page,
}) => {
  await ready(page)
  let dialog = await customize(page)
  await expect(dialog.getByRole('tab')).toHaveText([
    'Κατά την περιστροφή',
    'Μετά την περιστροφή',
    'Εμφάνιση',
  ])
  await expect(dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή')).toHaveValue('10')
  await expect(dialog.getByLabel('Μέγιστος αριθμός ορατών ονομάτων — τιμή')).toHaveValue('1000')
  await dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή').fill('60')
  await dialog.getByLabel('Εμφάνιση τίτλου', { exact: true }).uncheck()
  expect((await state(page)).wheels[0].customization.duration).toBe(10)
  await dialog.getByRole('button', { name: 'Ακύρωση', exact: true }).click()
  dialog = await customize(page)
  await expect(dialog.getByLabel('Εμφάνιση τίτλου', { exact: true })).toBeChecked()
  await dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή').fill('1')
  await dialog.getByLabel('Μέγιστος αριθμός ορατών ονομάτων — τιμή').fill('4')
  await dialog.getByLabel('Εμφάνιση τίτλου', { exact: true }).uncheck()
  await dialog.getByLabel('Αργή περιστροφή', { exact: true }).check()
  await dialog.getByLabel('Εμφάνιση διπλότυπων επιλογών', { exact: true }).uncheck()
  await dialog.getByLabel('Ήχος περιστροφής', { exact: true }).selectOption('drum')
  await dialog.getByLabel('Ένταση περιστροφής — τιμή').fill('25')
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog.getByLabel('Ήχος αποτελέσματος', { exact: true }).selectOption('chime')
  await dialog.getByLabel('Ένταση αποτελέσματος — τιμή').fill('75')
  await dialog.getByLabel('Μήνυμα popup', { exact: true }).fill('Ο νικητής μας 🎉')
  await dialog.getByLabel('Εμφάνιση popup αποτελέσματος', { exact: true }).uncheck()
  await expect(dialog.getByLabel('Μήνυμα popup', { exact: true })).toBeDisabled()
  await dialog.getByLabel('Animation νικήτριας επιλογής', { exact: true }).check()
  await dialog.getByLabel('Confetti', { exact: true }).uncheck()
  await dialog.getByLabel('Εμφάνιση κουμπιού «Αφαίρεση»', { exact: true }).uncheck()
  await dialog.getByLabel('Ήχος click κατά την αφαίρεση νικητή', { exact: true }).check()
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.getByLabel('Εφαρμογή θέματος', { exact: true }).selectOption('ocean')
  await dialog.getByLabel('Ενεργό χρώμα 1', { exact: true }).uncheck()
  await dialog.getByLabel('Χρώμα 2', { exact: true }).fill('#112233')
  await dialog.getByRole('button', { name: 'Εικόνα συλλογής 1' }).click()
  await dialog.getByLabel('Μέγεθος κεντρικής εικόνας', { exact: true }).selectOption('XXL')
  await dialog.getByLabel('Χρώμα φόντου παρουσίασης', { exact: true }).fill('#aabbcc')
  await dialog.getByLabel('Εμφάνιση χρωματικού gradient στη σελίδα', { exact: true }).uncheck()
  await dialog.getByLabel('Κείμενο στον τροχό', { exact: true }).selectOption('unless_image')
  await dialog.getByLabel('Περιγράμματα τμημάτων', { exact: true }).check()
  await dialog.getByLabel('Σκιά τροχού', { exact: true }).uncheck()
  await dialog.getByLabel('Αλλαγή χρώματος δείκτη κατά την περιστροφή', { exact: true }).uncheck()
  await save(page)
  const config = (await state(page)).wheels[0].customization
  expect(config).toMatchObject({
    duration: 1,
    max_names: 4,
    slow_spin: true,
    show_title: false,
    show_duplicates: false,
    spin_sound: 'drum',
    spin_volume: 25,
    result_sound: 'chime',
    result_volume: 75,
    popup: false,
    popup_message: 'Ο νικητής μας 🎉',
    animate_winner: true,
    confetti: false,
    remove_button: false,
    removal_sound: true,
    center_size: 'XXL',
    center_image: '/images/aurora.webp',
    page_color: '#aabbcc',
    gradient: false,
    text: 'unless_image',
    borders: true,
    shadow: false,
    pointer_changes: false,
  })
  await page.reload()
  await expect(page.locator('.wheel-title')).toHaveCount(0)
  await expect(page.locator('.wheel-center-image')).toHaveCSS('width', /.+px/)
  await expect(page.locator('.wheel-rim')).toHaveCSS('box-shadow', 'none')
  expect((await state(page)).wheels[0].customization).toEqual(config)
  const remote: Wheel[] = await (await page.request.get('/api/wheels')).json()
  expect(remote[0].customization).toEqual(config)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.locator('.inline-result strong')).not.toBeEmpty()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.confetti')).toHaveCount(0)
  await expect(page.locator('.winning-sector')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Αφαίρεσε την επιλογή', exact: true })).toHaveCount(
    0,
  )
  const data = await state(page)
  const winner = data.wheels[0].results[0]
  const selected = await page.locator('.wheel-svg').evaluate((svg) => {
    const rotation = Number((svg as SVGElement).style.transform.slice(7, -4))
    const entries = svg.querySelectorAll('[data-option-id]')
    const index = Math.floor(((360 - (rotation % 360)) % 360) / (360 / entries.length))
    return entries[index].getAttribute('data-option-id')
  })
  expect(selected).toBe(winner.option_id)
  expect(winner.choice_count).toBe(6)
})

test('entry images, mode visibility, upload, replacement, removal and text policies', async ({
  page,
}) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Εικόνα: Πίτσα 🍕', exact: true }).click()
  await page.getByRole('button', { name: 'Εικόνα συλλογής 2' }).click()
  await page.getByRole('button', { name: 'Κλείσιμο', exact: true }).click()
  let dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.getByLabel('Κείμενο στον τροχό', { exact: true }).selectOption('unless_image')
  await save(page)
  await expect(page.locator('.wheel-svg text')).toHaveCount(5)
  await expect(page.locator('.wheel-svg image')).toHaveCount(1)
  dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.getByLabel('Εικόνα φόντου τροχού', { exact: true }).check()
  await expect(dialog.getByLabel('Εφαρμογή θέματος')).toHaveCount(0)
  await expect(dialog.getByLabel('Μέγεθος κεντρικής εικόνας')).toHaveCount(0)
  await dialog.locator('input[type=file]').setInputFiles('public/images/aurora.webp')
  await expect(dialog.locator('.image-preview')).toHaveAttribute('src', /^data:image\/webp;base64,/)
  await dialog.getByRole('button', { name: 'Εικόνα συλλογής 3' }).click()
  await expect(dialog.locator('.image-preview')).toHaveAttribute('src', '/images/confetti.webp')
  await dialog.getByRole('button', { name: 'Αφαίρεση εικόνας', exact: true }).click()
  await expect(dialog.locator('.image-preview')).toHaveCount(0)
  await dialog.locator('input[type=file]').setInputFiles('public/images/aurora.webp')
  await expect(dialog.locator('.image-preview')).toHaveAttribute('src', /^data:image\/webp;base64,/)
  await dialog.getByLabel('Κείμενο στον τροχό', { exact: true }).selectOption('never')
  await save(page)
  await expect(page.locator('.wheel-svg text')).toHaveCount(0)
  await expect(page.locator('.wheel-svg > image')).toHaveAttribute(
    'href',
    /^data:image\/webp;base64,/,
  )
  await page.reload()
  await expect(page.locator('.wheel-svg > image')).toHaveAttribute(
    'href',
    /^data:image\/webp;base64,/,
  )
})

test('automatic winner removal persists through refresh and is idempotent with manual removal', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await ready(page)
  let dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog
    .getByLabel('Αυτόματη αφαίρεση νικητή μετά από 5 δευτερόλεπτα', { exact: true })
    .check()
  await dialog.getByLabel('Εμφάνιση popup αποτελέσματος', { exact: true }).uncheck()
  await save(page)
  await showScreen(page, 'options')
  await page.getByRole('switch', { name: 'Χωρίς επανάληψη', exact: true }).check()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.locator('.inline-result strong')).not.toBeEmpty()
  await expect.poll(async () => (await state(page)).removals.length).toBe(1)
  const winner = (await state(page)).wheels[0].results[0]
  await page.reload()
  await expect.poll(async () => (await state(page)).wheels[0].options.length).toBe(5)
  expect((await state(page)).wheels[0].options.some((o) => o.id === winner.option_id)).toBe(false)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.locator('.inline-result strong')).not.toBeEmpty()
  await page
    .locator('.inline-result')
    .getByRole('button', { name: 'Αφαίρεσε την επιλογή', exact: true })
    .click()
  await expect.poll(async () => (await state(page)).removals.length).toBe(0)
  expect((await state(page)).wheels[0].options.length).toBe(4)
  await page.waitForTimeout(5200)
  expect((await state(page)).wheels[0].options.length).toBe(4)
  await showScreen(page, 'options')
  for (let i = 0; i < 3; i++) await page.locator('.remove-option').first().click()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.locator('.inline-result strong')).not.toBeEmpty()
  await expect.poll(async () => (await state(page)).wheels[0].options.length).toBe(0)
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeDisabled()
  dialog = await customize(page)
  await dialog.getByRole('button', { name: 'Ακύρωση' }).click()
})

test('pending automatic removal follows the conflict copy without modifying the newer original', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await ready(page)
  const dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog
    .getByLabel('Αυτόματη αφαίρεση νικητή μετά από 5 δευτερόλεπτα', { exact: true })
    .check()
  await dialog.getByLabel('Εμφάνιση popup αποτελέσματος', { exact: true }).uncheck()
  await save(page)
  const original = (await state(page)).wheels[0]
  const session = await (await page.request.get('/api/session')).json()
  await context.setOffline(true)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect.poll(async () => (await state(page)).removals.length).toBe(1)
  const response = await page.request.put(`/api/wheels/${original.id}`, {
    headers: { 'X-CSRF-Token': session.csrf },
    data: {
      revision: original.revision,
      mutation_id: crypto.randomUUID(),
      title: 'Νεότερος αρχικός τροχός',
      no_repeat: original.no_repeat,
      customization: original.customization,
      options: original.options,
      results: [],
    },
  })
  expect(response.ok()).toBe(true)
  await context.setOffline(false)
  await expect.poll(async () => (await state(page)).active).not.toBe(original.id)
  await expect
    .poll(async () => {
      const data = await state(page)
      return data.wheels.find((wheel) => wheel.id === data.active)!.options.length
    })
    .toBe(5)
  expect((await state(page)).removals).toHaveLength(0)
  const remote: Wheel = await (await page.request.get(`/api/wheels/${original.id}`)).json()
  expect(remote.options).toHaveLength(6)
  expect(remote.title).toBe('Νεότερος αρχικός τροχός')
})

test('customization and embedded images work offline and synchronize once', async ({
  page,
  context,
}) => {
  await ready(page)
  await expect(page.getByText('Έτοιμο και χωρίς internet.', { exact: true })).toBeVisible()
  await page.reload()
  await context.setOffline(true)
  let dialog = await customize(page)
  await dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή').fill('1')
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.getByRole('button', { name: 'Εικόνα συλλογής 1' }).click()
  await dialog.getByLabel('Μέγεθος κεντρικής εικόνας', { exact: true }).selectOption('L')
  await dialog.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.wheel-center-image')).toHaveAttribute('src', '/images/aurora.webp')
  expect(
    await page
      .locator('.wheel-center-image')
      .evaluate((img) => (img as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Τοπική κλήρωση')
  await page.getByRole('dialog').getByRole('button', { name: 'Κλείσιμο' }).click()
  await context.setOffline(false)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Αποθήκευση', exact: true }).click()
  await expect
    .poll(async () => {
      const wheels: Wheel[] = await (await page.request.get('/api/wheels')).json()
      return wheels[0].customization.center_size
    })
    .toBe('L')
  const wheels: Wheel[] = await (await page.request.get('/api/wheels')).json()
  expect(wheels[0].results).toHaveLength(1)
  dialog = await customize(page)
  await dialog.getByRole('button', { name: 'Ακύρωση' }).click()
})

test('1000 visible entries, bounded editor and winning ID survive a four-name projection', async ({
  page,
}) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Μαζική προσθήκη', exact: true }).click()
  await page
    .locator('#bulk-options')
    .fill(Array.from({ length: 1001 }, (_, i) => `Entry ${i}`).join('\n'))
  await page.getByRole('button', { name: 'Πρόσθεσε τις γραμμές', exact: true }).click()
  await expect(page.locator('.option-row')).toHaveCount(200)
  await expect(page.locator('.wheel-svg [data-option-id]')).toHaveCount(1000)
  await page.getByRole('button', { name: 'Επόμενες', exact: true }).click()
  await expect(page.getByLabel('Επιλογή 201', { exact: true })).toHaveValue('Entry 194')
  const dialog = await customize(page)
  await dialog.getByLabel('Μέγιστος αριθμός ορατών ονομάτων — τιμή').fill('4')
  await dialog.getByLabel('Διάρκεια περιστροφής (δευτερόλεπτα) — τιμή').fill('1')
  await dialog.getByRole('tab', { name: 'Μετά την περιστροφή' }).click()
  await dialog.getByLabel('Εμφάνιση popup αποτελέσματος', { exact: true }).uncheck()
  await save(page)
  await page.evaluate(() => {
    const colors: string[] = []
    Object.assign(window, { pointerColors: colors })
    const pointer = document.querySelector('.wheel-pointer') as HTMLElement
    new MutationObserver(() => colors.push(pointer.style.background)).observe(pointer, {
      attributes: true,
    })
  })
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Επιλογές', exact: true })).toBeDisabled()
  await expect(page.locator('.inline-result strong')).not.toBeEmpty()
  const data = await state(page)
  const winner = data.wheels[0].results[0]
  expect(winner.choice_count).toBe(1007)
  expect(data.wheels[0].options).toHaveLength(1007)
  const selected = await page.locator('.wheel-svg').evaluate((svg) => {
    const rotation = Number((svg as SVGElement).style.transform.slice(7, -4))
    const options = svg.querySelectorAll('[data-option-id]')
    return options[
      Math.floor(((360 - (rotation % 360)) % 360) / (360 / options.length))
    ].getAttribute('data-option-id')
  })
  expect(selected).toBe(winner.option_id)
  expect(
    await page.evaluate(
      () => new Set((window as unknown as { pointerColors: string[] }).pointerColors).size,
    ),
  ).toBeGreaterThan(1)
  await expect(page.locator('.confetti i')).toHaveCount(40)
})

test('palette, all center sizes and presentation background are applied to the renderer', async ({
  page,
}) => {
  await ready(page)
  let dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  for (let index = 2; index <= 6; index++)
    await dialog.getByLabel(`Ενεργό χρώμα ${index}`, { exact: true }).uncheck()
  await expect(dialog.getByLabel('Ενεργό χρώμα 1', { exact: true })).toBeDisabled()
  await dialog.getByLabel('Χρώμα 1', { exact: true }).fill('#010203')
  await dialog.getByLabel('Περιγράμματα τμημάτων', { exact: true }).check()
  await dialog.getByRole('button', { name: 'Εικόνα συλλογής 1' }).click()
  await dialog.getByLabel('Χρώμα φόντου παρουσίασης', { exact: true }).fill('#112233')
  await dialog.getByLabel('Εμφάνιση χρωματικού gradient στη σελίδα', { exact: true }).uncheck()
  await save(page)
  await expect(page.locator('.wheel-svg [data-option-id] > path').first()).toHaveAttribute(
    'fill',
    '#010203',
  )
  await expect(page.locator('.wheel-svg [data-option-id] > path').first()).toHaveAttribute(
    'stroke',
    '#343044',
  )
  await expect(page.locator('.wheel-svg text').first()).toHaveAttribute('fill', '#ffffff')
  for (const [size, percent] of [
    ['XS', 10],
    ['S', 16],
    ['M', 24],
    ['L', 32],
    ['XL', 42],
    ['XXL', 54],
  ] as const) {
    dialog = await customize(page)
    await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
    await dialog.getByLabel('Μέγεθος κεντρικής εικόνας', { exact: true }).selectOption(size)
    await dialog.getByRole('button', { name: 'OK', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('.wheel-center-image')).toHaveAttribute(
      'style',
      new RegExp(`width: ${percent}%`),
    )
  }
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Προβολή παρουσίασης', exact: true }).click()
  await expect(page.locator('.app.presenting')).toHaveCSS('background-color', 'rgb(17, 34, 51)')
  await expect(page.locator('.app.presenting')).toHaveCSS('background-image', 'none')
  await expect(page.locator('.wheel-title')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await page.getByRole('button', { name: 'Έξοδος παρουσίασης', exact: true }).click()
  dialog = await customize(page)
  await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
  await dialog.getByLabel('Εμφάνιση χρωματικού gradient στη σελίδα', { exact: true }).check()
  await dialog.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Προβολή παρουσίασης', exact: true }).click()
  await expect(page.locator('.app.presenting')).toHaveCSS('background-image', /linear-gradient/)
  await page.getByRole('button', { name: 'Έξοδος παρουσίασης', exact: true }).click()
})

for (const width of [360, 390, 768, 1440])
  test(`customize accessibility and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await ready(page)
    const dialog = await customize(page)
    for (const tab of ['Κατά την περιστροφή', 'Μετά την περιστροφή', 'Εμφάνιση']) {
      await dialog.getByRole('tab', { name: tab, exact: true }).click()
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      const scan = await new AxeBuilder({ page })
        .include('dialog')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      expect(scan.violations).toEqual([])
    }
    await page.screenshot({ path: `../artifacts/customize-${width}.png`, fullPage: true })
    await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(dialog.getByRole('tab', { name: 'Μετά την περιστροφή' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Προσαρμογή', exact: true })).toBeFocused()
    if (width === 390 || width === 1440) {
      await page.getByRole('button', { name: 'Σκοτεινό θέμα', exact: true }).click()
      await customize(page)
      await dialog.getByRole('tab', { name: 'Εμφάνιση', exact: true }).click()
      const dark = await new AxeBuilder({ page })
        .include('dialog')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      expect(dark.violations).toEqual([])
      await page.screenshot({ path: `../artifacts/customize-dark-${width}.png`, fullPage: true })
    }
  })
