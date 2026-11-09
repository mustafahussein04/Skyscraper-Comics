import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import firefox from 'selenium-webdriver/firefox.js'

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = resolve(frontendDir, '..')
const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173'
const browser = (process.env.E2E_BROWSER ?? 'chrome').toLowerCase()
const screenshotDir = resolve(frontendDir, 'test-reports', 'screenshots')
const reportDir = resolve(frontendDir, 'test-reports')
const reportPath = resolve(reportDir, `admin-login-report-${browser}.md`)
const summaryPath = resolve(reportDir, 'admin-login-report.md')
const results = []
const children = []

const credentials = {
  email: process.env.ADMIN_EMAIL ?? 'admin@skyscrapercomics.com',
  password: process.env.ADMIN_PASSWORD ?? 'admin123',
}

function start(command, args, cwd) {
  const npmCli = resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  const child = command === 'npm.cmd'
    ? spawn(process.execPath, [npmCli, ...args], { cwd, stdio: 'inherit', windowsHide: true })
    : command === 'node'
      ? spawn(process.execPath, args, { cwd, stdio: 'inherit', windowsHide: true })
    : spawn(command, args, { cwd, stdio: 'inherit' })
  children.push(child)
  return child
}

async function waitFor(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function stopServers() {
  for (const child of children) child.kill()
}

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

async function loginPage(driver) {
  await driver.get(`${baseUrl}/admin/login`)
  await driver.executeScript('window.sessionStorage.clear()')
  await driver.navigate().refresh()
  await driver.wait(until.elementLocated(By.id('email')), 10000)
}

async function submit(driver, email, password) {
  await driver.findElement(By.id('email')).sendKeys(email)
  await driver.findElement(By.id('password')).sendKeys(password)
  await driver.findElement(By.css('button[type="submit"]')).click()
}

async function assertPath(driver, expected) {
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(expected), 10000)
}

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
  await driver.takeScreenshot().then(data => writeFile(resolve(screenshotDir, fileName), data, 'base64'))
  results.push(result)
  if (result.status === 'FAIL') console.error(`FAIL: ${name}\n${result.error}`)
  else console.log(`PASS: ${name}`)
}

async function main() {
  if (!['chrome', 'firefox'].includes(browser)) throw new Error('E2E_BROWSER must be chrome or firefox')
  if (!existsSync(resolve(frontendDir, 'dist', 'index.html'))) {
    throw new Error('Frontend build not found. Run "npm.cmd run build" first, then rerun this test.')
  }
  await mkdir(screenshotDir, { recursive: true })
  let backend
  try {
    await waitFor('http://127.0.0.1:3001/api/events', 1000)
  } catch {
    backend = start('npm.cmd', ['run', 'dev'], resolve(repoDir, 'backend'))
    backend.once('error', error => console.error('Backend failed to start:', error.message))
    await waitFor('http://127.0.0.1:3001/api/events')
  }

  const frontend = start('node', ['scripts/static-server.mjs'], frontendDir)
  frontend.once('error', error => console.error('Frontend failed to start:', error.message))
  await waitFor(baseUrl)

  const driver = await createDriver()
  try {
    await runCase(driver, 'valid-login-redirects-to-dashboard', async () => {
      await loginPage(driver)
      await submit(driver, credentials.email, credentials.password)
      await assertPath(driver, '/admin')
    })

    for (const [name, email, password] of [
      ['wrong-password', credentials.email, 'wrong-password'],
      ['wrong-email', 'wrong@example.com', credentials.password],
      ['blank-fields', '', ''],
    ]) {
      await runCase(driver, `invalid-login-${name}`, async () => {
        await loginPage(driver)
        await submit(driver, email, password)
        const alert = await driver.wait(until.elementLocated(By.css('[role="alert"]')), 10000)
        if ((await alert.getText()) !== 'Invalid email or password.') throw new Error('Unexpected login error')
        await assertPath(driver, '/admin/login')
      })
    }

    for (const path of ['/admin', '/admin/products', '/admin/events']) {
      await runCase(driver, `logged-out-${path.slice(1).replaceAll('/', '-')}-redirect`, async () => {
        await driver.executeScript('window.sessionStorage.clear()')
        await driver.get(`${baseUrl}${path}`)
        await assertPath(driver, '/admin/login')
      })
    }

    await runCase(driver, 'logged-in-login-redirects-to-dashboard', async () => {
      await loginPage(driver)
      await submit(driver, credentials.email, credentials.password)
      await assertPath(driver, '/admin')
      await driver.get(`${baseUrl}/admin/login`)
      await assertPath(driver, '/admin')
    })
  } finally {
    await driver.quit()
    stopServers()
  }

  const failed = results.filter(result => result.status === 'FAIL')
  const lines = [
    `# Admin Login & Route Protection — ${browser}`,
    '',
    `Run date: ${new Date().toISOString()}`, '',
    '| Test | Status | Screenshot |', '|---|---|---|',
    ...results.map(result => `| ${result.name} | ${result.status}${result.error ? ` — ${result.error}` : ''} | [screenshot](${result.screenshot}) |`),
  ]
  await writeFile(reportPath, `${lines.join('\n')}\n`)

  const browserReports = []
  for (const reportBrowser of ['chrome', 'firefox']) {
    const browserReport = resolve(reportDir, `admin-login-report-${reportBrowser}.md`)
    if (existsSync(browserReport)) {
      const content = await readFile(browserReport, 'utf8')
      const status = content.includes('| FAIL') ? 'FAILURES PRESENT' : 'PASS'
      browserReports.push(`| ${reportBrowser} | ${status} | [report](admin-login-report-${reportBrowser}.md) |`)
    } else {
      browserReports.push(`| ${reportBrowser} | NOT RUN | — |`)
    }
  }
  await writeFile(summaryPath, [
    '# Admin Login & Route Protection', '',
    `Last updated: ${new Date().toISOString()}`, '',
    'Each browser has a separate report so one run never overwrites another.', '',
    '| Browser | Status | Evidence |', '|---|---|---|',
    ...browserReports, '',
  ].join('\n'))
  if (failed.length) process.exitCode = 1
}

main().catch(error => {
  stopServers()
  console.error(error)
  process.exitCode = 1
})
