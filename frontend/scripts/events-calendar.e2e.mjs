/**
 * SCRUM-175 — System test: Admin Events list & Public Events page.
 *
 * Selenium, matching frontend/scripts/admin-login.e2e.mjs (same report/screenshot layout,
 * same E2E_BROWSER switch). Runs against the built app served by scripts/static-server.mjs,
 * so run `npm run build` in frontend/ first.
 *
 * Differences from the login suite, both deliberate:
 *  - It picks a free port (default 5173) so it can run while `npm run dev` is up.
 *  - Every event it creates is titled with a unique E2E-175-<run> prefix and deleted from the
 *    API in a finally block, so repeat runs stay clean and the local DB isn't polluted.
 *
 * Usage:
 *   E2E_BROWSER=chrome  npm run test:e2e:events
 *   E2E_BROWSER=firefox npm run test:e2e:events
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Builder, By, Select, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import firefox from 'selenium-webdriver/firefox.js'

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = resolve(frontendDir, '..')
const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:3001'
const browser = (process.env.E2E_BROWSER ?? 'chrome').toLowerCase()
const screenshotDir = resolve(frontendDir, 'test-reports', 'screenshots')
const reportDir = resolve(frontendDir, 'test-reports')
const reportPath = resolve(reportDir, `events-calendar-report-${browser}.md`)
const summaryPath = resolve(reportDir, 'events-calendar-report.md')

const PREFIX = `E2E-175-${Date.now().toString(36)}`
const VALIDATION_MESSAGE = 'Enter a valid Registration Link starting with http:// or https://.'
const REGISTRATION_LINK = 'https://example.com/register'
const results = []
const children = []
let frontendPort = Number(process.env.E2E_PORT ?? 5173)

const credentials = {
  email: process.env.ADMIN_EMAIL ?? 'admin@skyscrapercomics.com',
  password: process.env.ADMIN_PASSWORD ?? 'admin123',
}

// Must be `localhost`: backend/lib/cors.ts echoes http://localhost:5173 but treats
// http://127.0.0.1:5173 as a different origin, which blocks every XHR from the app.
const baseUrl = () => `http://localhost:${frontendPort}`

// ── process helpers ──────────────────────────────────────────────────────────

function start(command, args, cwd, env = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, ...env },
  })
  children.push(child)
  return child
}

function stopServers() {
  for (const child of children) {
    try { child.kill() } catch { /* already gone */ }
  }
}

async function waitFor(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      // Abort a hung connection: without a signal, a wedged server stalls this loop forever.
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
      if (response.ok) return
    } catch { /* still starting, or the server stopped answering */ }
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function portIsFree(port) {
  return new Promise(done => {
    const server = createServer()
    server.once('error', () => done(false))
    server.once('listening', () => server.close(() => done(true)))
    server.listen(port, '127.0.0.1')
  })
}

async function pickPort(start) {
  for (let port = start; port < start + 20; port += 1) {
    if (await portIsFree(port)) return port
  }
  throw new Error(`No free port between ${start} and ${start + 20}`)
}

/**
 * The backend's CORS allowlist only accepts http://localhost:5173 and http://127.0.0.1:5173
 * (backend/lib/cors.ts), so the browser must load the app from that origin or every API call
 * fails and admin login silently never completes. Prefer 5173; if something is already serving
 * there (a dev server), reuse it rather than fighting for the port.
 */
async function startFrontend() {
  const port = frontendPort
  if (!(await portIsFree(port))) {
    try {
      await waitFor(baseUrl(), 3000)
      frontendPort = port
      console.log(`Reusing the server already listening on ${baseUrl()} (not the dist build).`)
      return
    } catch {
      throw new Error(
        `Port ${port} is in use but not serving the app. Stop it, or run with a backend started as ` +
        `FRONTEND_URL=http://127.0.0.1:<port> npm run dev.`,
      )
    }
  }
  frontendPort = await pickPort(port)
  start(process.execPath, ['scripts/static-server.mjs'], frontendDir, { PORT: String(frontendPort) })
  await waitFor(baseUrl())
}

// ── api helpers (used for setup assertions and cleanup only) ─────────────────

async function apiEvents() {
  const response = await fetch(`${apiUrl}/api/events`)
  if (!response.ok) throw new Error(`GET /api/events -> ${response.status}`)
  return response.json()
}

async function apiEventTitles() {
  return (await apiEvents()).map(event => event.title)
}

async function deleteRunEvents() {
  const mine = (await apiEvents()).filter(event => String(event.title).startsWith('E2E-175-'))
  for (const event of mine) {
    await fetch(`${apiUrl}/api/events/${event.id}`, { method: 'DELETE' }).catch(() => {})
  }
}

// ── test data ────────────────────────────────────────────────────────────────

function isoDaysFromNow(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function eventSpec(label, overrides = {}) {
  return {
    title: `${PREFIX} ${label}`,
    date: isoDaysFromNow(30),
    time: '7:00 PM - 10:00 PM',
    category: 'Tabletop Games',
    game: 'Commander',
    capacity: '32',
    entryFee: '$10',
    description: 'Created by the SCRUM-175 system test.',
    registrationLink: REGISTRATION_LINK,
    ...overrides,
  }
}

// ── driver helpers ───────────────────────────────────────────────────────────

async function createDriver() {
  const builder = new Builder().forBrowser(browser)
  if (browser === 'firefox') {
    const options = new firefox.Options()
    if (process.env.E2E_HEADLESS !== 'false') options.addArguments('-headless')
    builder.setFirefoxOptions(options)
    if (process.env.GECKODRIVER_PATH) builder.setFirefoxService(new firefox.ServiceBuilder(process.env.GECKODRIVER_PATH))
  } else {
    const options = new chrome.Options()
    if (process.env.E2E_HEADLESS !== 'false') options.addArguments('--headless=new')
    options.addArguments('--window-size=1440,1000', '--no-sandbox', '--disable-dev-shm-usage')
    builder.setChromeOptions(options)
    if (process.env.CHROMEDRIVER_PATH) builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH))
  }
  return builder.build()
}

async function login(driver) {
  await driver.get(`${baseUrl()}/admin/login`)
  await driver.executeScript('window.sessionStorage.clear()')
  await driver.navigate().refresh()
  await driver.wait(until.elementLocated(By.id('email')), 10000)
  await driver.findElement(By.id('email')).sendKeys(credentials.email)
  await driver.findElement(By.id('password')).sendKeys(credentials.password)
  await driver.findElement(By.css('button[type="submit"]')).click()
  // "/admin/login" also contains "/admin", so exclude the login path explicitly.
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl()
    return url.includes('/admin') && !url.includes('/login')
  }, 15000)
  const session = await driver.executeScript('return window.sessionStorage.getItem("skyscraper-comics-admin-session")')
  if (session !== 'true') throw new Error('Login did not create an admin session — check the API/CORS wiring')
}

async function openAdminEvents(driver) {
  await driver.get(`${baseUrl()}/admin/events`)
  await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Add new Event']")), 15000)
}

async function setText(driver, id, value) {
  const element = await driver.findElement(By.id(id))
  await element.clear()
  if (value !== '') await element.sendKeys(value)
}

/** type="date" inputs are formatted per-locale by sendKeys; set the value and let Vue's v-model see it. */
async function setDate(driver, id, isoDate) {
  const element = await driver.findElement(By.id(id))
  await driver.executeScript(`
    const el = arguments[0], value = arguments[1]
    el.value = value
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  `, element, isoDate)
}

async function openCreateModal(driver) {
  await driver.findElement(By.xpath("//button[normalize-space()='Add new Event']")).click()
  await driver.wait(until.elementLocated(By.id('edit-title')), 10000)
}

async function fillEventForm(driver, spec) {
  await setText(driver, 'edit-title', spec.title)
  await setDate(driver, 'edit-date', spec.date)
  await setText(driver, 'edit-time', spec.time)
  if (spec.category) await new Select(await driver.findElement(By.id('edit-category'))).selectByVisibleText(spec.category)
  await setText(driver, 'edit-game', spec.game)
  await setText(driver, 'edit-capacity', spec.capacity)
  await setText(driver, 'edit-entryfee', spec.entryFee)
  await setText(driver, 'edit-description', spec.description)
  if (spec.registrationLink !== undefined) await setText(driver, 'edit-registration-link', spec.registrationLink)
}

async function submitModal(driver) {
  await driver.findElement(By.css('form button[type="submit"]')).click()
}

/** Creates an event through the admin UI and waits for the success banner. */
async function createEventViaUI(driver, spec) {
  await openAdminEvents(driver)
  await openCreateModal(driver)
  await fillEventForm(driver, spec)
  await submitModal(driver)
  const status = await driver.wait(until.elementLocated(By.css('p[role="status"]')), 15000)
  const text = await status.getText()
  if (!text.includes('created')) throw new Error(`Unexpected success banner: "${text}"`)
  await driver.wait(async () => (await driver.findElements(By.id('edit-title'))).length === 0, 10000)
}

async function adminTitles(driver) {
  const headings = await driver.findElements(By.css('article h3'))
  const titles = []
  for (const heading of headings) titles.push((await heading.getText()).trim())
  return titles
}

/** Clicks the public calendar cell for a date, paging forward when the date is in a later month. */
async function openPublicDay(driver, isoDate) {
  await driver.get(`${baseUrl()}/events`)
  await driver.wait(until.elementLocated(By.css('.fc-daygrid-day')), 20000)
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const cells = await driver.findElements(By.css(`.fc-daygrid-day[data-date="${isoDate}"]`))
    if (cells.length > 0) {
      await cells[0].click()
      // Clicking a day that already has an event chip fires FullCalendar's eventClick, which sets
      // the selected date but does NOT apply the selection outline — so don't wait on the class.
      await driver.sleep(600)
      return
    }
    const next = await driver.findElements(By.css('.fc-next-button'))
    if (next.length === 0) break
    await next[0].click()
    await driver.sleep(400)
  }
  throw new Error(`Could not open ${isoDate} in the public calendar`)
}

async function publicUpcomingTitles(driver) {
  const panel = await driver.findElement(By.css('div[class*="max-h-[720px]"]'))
  const titles = await panel.findElements(By.css('p[class*="font-bold"]'))
  const values = []
  for (const title of titles) values.push((await title.getText()).trim())
  return values
}

async function deleteViaUI(driver, title) {
  await driver.findElement(By.css(`button[aria-label="Delete ${title}"]`)).click()
  await driver.wait(until.alertIsPresent(), 5000)
  await driver.switchTo().alert().accept()
  await driver.wait(async () => !(await adminTitles(driver)).includes(title), 10000)
}

// ── assertion helper (kept tiny on purpose) ──────────────────────────────────

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label}: expected "${expected}", got "${actual}"`)
}

// ── test runner ──────────────────────────────────────────────────────────────

async function runCase(driver, name, callback) {
  const result = { name, browser, status: 'PASS', screenshot: '' }
  try {
    await callback()
  } catch (error) {
    result.status = 'FAIL'
    result.error = error instanceof Error ? error.message : String(error)
  }
  const fileName = `${browser}-${name.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
  result.screenshot = `screenshots/${fileName}`
  await driver.takeScreenshot().then(data => writeFile(resolve(screenshotDir, fileName), data, 'base64')).catch(() => {})
  results.push(result)
  if (result.status === 'FAIL') console.error(`FAIL: ${name}\n  ${result.error}`)
  else console.log(`PASS: ${name}`)
}

async function writeReports() {
  const lines = [
    `# SCRUM-175 — Admin Events & Public Events Page — ${browser}`,
    '',
    `Run date: ${new Date().toISOString()}`,
    `Events created by this run use the title prefix \`${PREFIX}\` and are deleted afterwards.`,
    '',
    '| Test | Status | Screenshot |', '|---|---|---|',
    ...results.map(result =>
      `| ${result.name} | ${result.status}${result.error ? ` — ${result.error}` : ''} | [screenshot](${result.screenshot}) |`),
  ]
  await writeFile(reportPath, `${lines.join('\n')}\n`)

  const browserReports = []
  for (const reportBrowser of ['chrome', 'firefox']) {
    const file = resolve(reportDir, `events-calendar-report-${reportBrowser}.md`)
    if (existsSync(file)) {
      const content = await readFile(file, 'utf8')
      const status = content.includes('| FAIL') ? 'FAILURES PRESENT' : 'PASS'
      browserReports.push(`| ${reportBrowser} | ${status} | [report](events-calendar-report-${reportBrowser}.md) |`)
    } else {
      browserReports.push(`| ${reportBrowser} | NOT RUN | — |`)
    }
  }
  await writeFile(summaryPath, [
    '# SCRUM-175 — Admin Events & Public Events Page', '',
    `Last updated: ${new Date().toISOString()}`, '',
    'Each browser has a separate report so one run never overwrites another.', '',
    '| Browser | Status | Evidence |', '|---|---|---|',
    ...browserReports, '',
  ].join('\n'))
}

async function main() {
  if (!['chrome', 'firefox'].includes(browser)) throw new Error('E2E_BROWSER must be chrome or firefox')
  if (!existsSync(resolve(frontendDir, 'dist', 'index.html'))) {
    throw new Error('Frontend build not found. Run "npm run build" in frontend/ first, then rerun this test.')
  }
  await mkdir(screenshotDir, { recursive: true })

  try {
    await waitFor(`${apiUrl}/api/events`, 1000)
  } catch {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    start(npm, ['run', 'dev'], resolve(repoDir, 'backend'))
    await waitFor(`${apiUrl}/api/events`)
  }

  await startFrontend()
  console.log(`SCRUM-175 e2e: ${browser} against ${baseUrl()} (api ${apiUrl})`)

  await deleteRunEvents()

  const driver = await createDriver()
  try {
    await login(driver)

    // 1 — valid create appears in the admin list
    await runCase(driver, 'create-event-valid-appears-in-admin-list', async () => {
      const spec = eventSpec('create')
      await createEventViaUI(driver, spec)
      const titles = await adminTitles(driver)
      assert(titles.includes(spec.title), `Created event "${spec.title}" is missing from the admin list`)
    })

    // 2 — admin list is sorted by date ascending, regardless of creation order
    await runCase(driver, 'admin-list-sorted-by-date', async () => {
      const late = eventSpec('sort-late', { date: isoDaysFromNow(34) })
      const early = eventSpec('sort-early', { date: isoDaysFromNow(26) })
      const middle = eventSpec('sort-middle', { date: isoDaysFromNow(30) })
      await createEventViaUI(driver, late)
      await createEventViaUI(driver, early)
      await createEventViaUI(driver, middle)
      const ours = (await adminTitles(driver)).filter(title => title.includes('sort-'))
      assertEqual(ours.join('|'), [early.title, middle.title, late.title].join('|'), 'admin list order')
    })

    // 3 — the public "Upcoming Events" panel is date-sorted too (same three events as case 2)
    await runCase(driver, 'public-upcoming-events-sorted-by-date', async () => {
      await driver.get(`${baseUrl()}/events`)
      await driver.wait(until.elementLocated(By.css('.fc-daygrid-day')), 20000)
      await driver.wait(until.elementLocated(By.css('div[class*="max-h-[720px]"]')), 15000)
      const ours = (await publicUpcomingTitles(driver)).filter(title => title.includes('sort-'))
      assertEqual(
        ours.join('|'),
        [eventSpec('sort-early', { date: isoDaysFromNow(26) }).title,
          eventSpec('sort-middle', { date: isoDaysFromNow(30) }).title,
          eventSpec('sort-late', { date: isoDaysFromNow(34) }).title].join('|'),
        'public upcoming order',
      )
    })

    // 4 — the event shows on the public page with a usable registration link
    await runCase(driver, 'public-page-shows-event-and-registration-link', async () => {
      const spec = eventSpec('public', { date: isoDaysFromNow(28) })
      await createEventViaUI(driver, spec)
      await openPublicDay(driver, spec.date)
      const heading = await driver.wait(until.elementLocated(By.xpath(`//h3[normalize-space()='${spec.title}']`)), 15000)
      assert(await heading.isDisplayed(), 'Event title is not visible in the public day panel')
      const link = await driver.findElement(By.xpath("//a[normalize-space()='Register for Event']"))
      assertEqual(await link.getAttribute('href'), REGISTRATION_LINK, 'registration href')
      assertEqual(await link.getAttribute('target'), '_blank', 'registration target')
      assert((await link.getAttribute('rel')).includes('noopener'), 'registration link is missing rel=noopener')
    })

    // 5 — editing date and time updates the admin list and the public page
    await runCase(driver, 'edit-date-and-time-updates-both-pages', async () => {
      const spec = eventSpec('edit', { date: isoDaysFromNow(31) })
      await createEventViaUI(driver, spec)
      const moved = { ...spec, date: isoDaysFromNow(33), time: '6:00 PM - 9:00 PM' }
      await driver.findElement(By.css(`button[aria-label="Edit ${spec.title}"]`)).click()
      await driver.wait(until.elementLocated(By.id('edit-title')), 10000)
      await setDate(driver, 'edit-date', moved.date)
      await setText(driver, 'edit-time', moved.time)
      await submitModal(driver)
      // The success banner is re-rendered on save; wait for the modal to close, then assert on the card.
      await driver.wait(async () => (await driver.findElements(By.id('edit-title'))).length === 0, 10000)

      const adminCard = await driver.findElement(By.xpath(`//article[.//h3[normalize-space()='${spec.title}']]`))
      const adminText = await adminCard.getText()
      assert(adminText.includes(moved.time), `Admin list did not show the new time (${moved.time})`)

      await openPublicDay(driver, moved.date)
      await driver.wait(until.elementLocated(By.xpath(`//h3[normalize-space()='${spec.title}']`)), 15000)
      const dayPanel = await driver.findElement(By.css('div[class*="max-h-[720px]"]'))
      const panelText = await dayPanel.getText()
      assert(panelText.includes(moved.time), `Public day panel did not show the new time (${moved.time})`)
    })

    // 6 — deleting removes it from both pages
    await runCase(driver, 'delete-event-removes-from-both-pages', async () => {
      const spec = eventSpec('delete', { date: isoDaysFromNow(29) })
      await createEventViaUI(driver, spec)
      await deleteViaUI(driver, spec.title)
      assert(!(await adminTitles(driver)).includes(spec.title), 'Deleted event is still in the admin list')

      await openPublicDay(driver, spec.date)
      await driver.sleep(1000)
      const matches = await driver.findElements(By.xpath(`//h3[normalize-space()='${spec.title}']`))
      assertEqual(String(matches.length), '0', 'deleted event still rendered on the public page')
    })

    // 7 — blank registration link is accepted, and the public page says registration is unavailable
    await runCase(driver, 'blank-registration-link-accepted', async () => {
      const spec = eventSpec('blank-link', { date: isoDaysFromNow(27), registrationLink: '' })
      await createEventViaUI(driver, spec)
      assert((await adminTitles(driver)).includes(spec.title), 'Event with a blank registration link was not created')

      await openPublicDay(driver, spec.date)
      await driver.wait(until.elementLocated(By.xpath(`//h3[normalize-space()='${spec.title}']`)), 15000)
      const disabled = await driver.findElement(By.xpath("//button[normalize-space()='Registration not available']"))
      assert(!(await disabled.isEnabled()), 'Expected the registration button to be disabled when no link is set')
    })

    // 8–11 — invalid registration links are rejected with the exact message from the acceptance criteria
    for (const [name, link] of [
      ['trailing-space', 'http://example.com '],
      ['relative-path', '/register'],
      ['ftp-scheme', 'ftp://example.com'],
      ['javascript-scheme', 'javascript:alert(1)'],
    ]) {
      await runCase(driver, `invalid-registration-link-${name}`, async () => {
        const spec = eventSpec(`invalid-${name}`, { registrationLink: link })
        await openAdminEvents(driver)
        await openCreateModal(driver)
        await fillEventForm(driver, spec)
        await submitModal(driver)
        const error = await driver.wait(until.elementLocated(By.id('registration-link-error')), 10000)
        assertEqual((await error.getText()).trim(), VALIDATION_MESSAGE, 'validation message')
        assert(await driver.findElement(By.id('edit-title')).isDisplayed(), 'Modal closed even though the link was invalid')
        assert(!(await apiEventTitles()).includes(spec.title), `Invalid link "${link}" was saved anyway`)
        // Leave the modal open and bring the error into view so the case's screenshot shows the
        // rejected value and the message. The next case reloads /admin/events, discarding it.
        await driver.executeScript('arguments[0].scrollIntoView({ block: "center" })', error)
        await driver.sleep(250)
      })
    }
  } finally {
    await deleteRunEvents().catch(() => {})
    await driver.quit()
    stopServers()
  }

  await writeReports()
  if (results.some(result => result.status === 'FAIL')) process.exitCode = 1
}

main().catch(error => {
  stopServers()
  console.error(error)
  process.exitCode = 1
})
