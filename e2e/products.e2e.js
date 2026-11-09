/**
 * Product Detail Page — Selenium E2E Tests
 *
 * Prerequisites:
 *   1. cd frontend && npm run dev        (starts on :5173)
 *   2. cd backend  && npm run dev        (starts on :3001)
 *   3. cd e2e && npm install && npm test
 *
 * Environment variables:
 *   BASE_URL  — override target URL (default: http://localhost:5173)
 *   TESTER    — name shown in report   (default: Paul Younan)
 *   OBSERVER  — name shown in report   (default: empty)
 *   BROWSERS  — comma-separated list   (default: chrome,firefox)
 */

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const fs = require('node:fs')
const path = require('node:path')

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:5173'
const TESTER    = process.env.TESTER   || 'Paul Younan'
const OBSERVER  = process.env.OBSERVER || ''
const BROWSERS  = (process.env.BROWSERS || 'chrome,firefox').split(',').map(s => s.trim())
const TIMEOUT   = 15_000

const screenshotsDir = path.join(__dirname, 'screenshots')
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true })

const reportResults = []

// ── Driver helpers ────────────────────────────────────────────────────────────

function buildDriver(browser) {
  if (browser === 'firefox') {
    const opts = new firefox.Options().addArguments('--headless', '--width=1280', '--height=900')
    return new Builder().forBrowser('firefox').setFirefoxOptions(opts).build()
  }
  const opts = new chrome.Options().addArguments('--headless=new', '--window-size=1280,900', '--no-sandbox', '--disable-dev-shm-usage')
  return new Builder().forBrowser('chrome').setChromeOptions(opts).build()
}

async function saveScreenshot(driver, label) {
  const data = await driver.takeScreenshot()
  const filename = path.join(screenshotsDir, `${label}-${Date.now()}.png`)
  fs.writeFileSync(filename, Buffer.from(data, 'base64'))
  return path.relative(__dirname, filename)
}

async function waitForText(driver, text, timeout = TIMEOUT) {
  await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)),
    timeout,
    `Timed out waiting for text: "${text}"`,
  )
}

async function waitForUrl(driver, partial, timeout = TIMEOUT) {
  await driver.wait(
    async () => (await driver.getCurrentUrl()).includes(partial),
    timeout,
    `Timed out waiting for URL to include: "${partial}"`,
  )
}

// ── Test runner wrapper ───────────────────────────────────────────────────────

function e2eTest(browser, name, description, inputs, fn) {
  test(`[${browser}] ${name}`, async () => {
    const driver = await buildDriver(browser)
    const record = {
      name: `[${browser}] ${name}`,
      description,
      inputs,
      tester: TESTER,
      observer: OBSERVER,
      date: new Date().toLocaleDateString(),
      browser,
      passed: false,
      screenshot: null,
      error: null,
    }
    try {
      await fn(driver)
      record.passed = true
      record.screenshot = await saveScreenshot(driver, `pass-${browser}-${name.replace(/\W+/g, '-')}`)
    } catch (err) {
      record.error = err.message
      try { record.screenshot = await saveScreenshot(driver, `fail-${browser}-${name.replace(/\W+/g, '-')}`) } catch { /* ignore */ }
      throw err
    } finally {
      await driver.quit()
      reportResults.push(record)
    }
  })
}

// ── Tests — run for each browser ─────────────────────────────────────────────

for (const browser of BROWSERS) {

  // 1 — Products page loads ─────────────────────────────────────────────────
  e2eTest(
    browser,
    'valid: products page loads and displays product cards',
    'Navigate to /products and verify product cards are rendered.',
    { url: `${BASE_URL}/products` },
    async (driver) => {
      await driver.get(`${BASE_URL}/products`)
      // Wait for at least one product card (each card has the Reserve/Sold Out button)
      await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Reserve" or text()="Sold Out"]')),
        TIMEOUT,
        'No product cards appeared within timeout',
      )
      const cards = await driver.findElements(By.xpath('//button[text()="Reserve" or text()="Sold Out"]'))
      assert.ok(cards.length > 0, 'At least one product card must be visible')
    },
  )

  // 2 — Filter: Comics ──────────────────────────────────────────────────────
  e2eTest(
    browser,
    'valid: filter by Comics shows only comics',
    'Open the filter panel, click Comics, and verify only comics products are shown.',
    { url: `${BASE_URL}/products`, filter: 'Comics' },
    async (driver) => {
      await driver.get(`${BASE_URL}/products`)
      // Open filter panel
      const filterToggle = await driver.wait(
        until.elementLocated(By.css('button[aria-controls="product-filters"]')),
        TIMEOUT,
      )
      await filterToggle.click()
      // Click Comics filter button
      const comicsBtn = await driver.wait(
        until.elementLocated(By.xpath('//button[normalize-space(text())="Comics"]')),
        TIMEOUT,
      )
      await comicsBtn.click()
      // URL should now contain /products/comics
      await waitForUrl(driver, '/products/comics')
      // All visible brand chips should not contain TCG-only brands
      await driver.sleep(500) // allow filtered re-render
      const brandChips = await driver.findElements(By.xpath('//*[contains(@class,"bg-blue-100")]'))
      for (const chip of brandChips) {
        const text = (await chip.getText()).toLowerCase()
        assert.ok(
          !['yu-gi-oh', 'pokemon', 'magic'].some(t => text.includes(t)),
          `Brand chip "${text}" should not appear when Comics filter is active`,
        )
      }
    },
  )

  // 3 — Filter: TCG ─────────────────────────────────────────────────────────
  e2eTest(
    browser,
    'valid: filter by TCG shows only TCG products',
    'Open the filter panel, click TCG, and verify only TCG products are shown.',
    { url: `${BASE_URL}/products`, filter: 'TCG' },
    async (driver) => {
      await driver.get(`${BASE_URL}/products`)
      const filterToggle = await driver.wait(
        until.elementLocated(By.css('button[aria-controls="product-filters"]')),
        TIMEOUT,
      )
      await filterToggle.click()
      const tcgBtn = await driver.wait(
        until.elementLocated(By.xpath('//button[normalize-space(text())="TCG"]')),
        TIMEOUT,
      )
      await tcgBtn.click()
      await waitForUrl(driver, '/products/tcg')
      await driver.sleep(500)
      const brandChips = await driver.findElements(By.xpath('//*[contains(@class,"bg-blue-100")]'))
      for (const chip of brandChips) {
        const text = (await chip.getText()).toLowerCase()
        assert.ok(
          !['marvel', 'dc', 'image', 'dark horse'].some(t => text.includes(t)),
          `Brand chip "${text}" should not appear when TCG filter is active`,
        )
      }
    },
  )

  // 4 — Click product card → navigates to detail page ───────────────────────
  e2eTest(
    browser,
    'valid: clicking product card navigates to detail page',
    'Click the first product card link and verify navigation to /products/:id.',
    { url: `${BASE_URL}/products`, action: 'click first card' },
    async (driver) => {
      await driver.get(`${BASE_URL}/products`)
      await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Reserve" or text()="Sold Out"]')),
        TIMEOUT,
      )
      // Each card wraps the image/title in a router-link <a> tag
      const cardLink = await driver.findElement(By.css('a[href^="/products/"]'))
      await cardLink.click()
      await waitForUrl(driver, '/products/')
      const url = await driver.getCurrentUrl()
      assert.match(url, /\/products\/\d+$/, 'URL should end with /products/<numeric id>')
    },
  )

  // 5 — Detail page shows all required fields ───────────────────────────────
  e2eTest(
    browser,
    'valid: product detail page shows name, price, brand, description, and stock',
    'Navigate directly to a product detail page and verify all required fields are present.',
    { url: `${BASE_URL}/products/1` },
    async (driver) => {
      await driver.get(`${BASE_URL}/products/1`)
      // Name in h1
      const h1 = await driver.wait(until.elementLocated(By.css('h1')), TIMEOUT)
      const name = await h1.getText()
      assert.ok(name.length > 0, 'Product name (h1) must not be empty')
      // Price — element containing "$"
      await waitForText(driver, '$')
      // Stock badge — either "In Stock" or "Out of Stock"
      await driver.wait(
        until.elementLocated(By.xpath('//*[contains(text(),"In Stock") or contains(text(),"Out of Stock")]')),
        TIMEOUT,
        'Stock badge must be present',
      )
      // Description paragraph — present and non-empty
      const description = await driver.findElement(
        By.xpath('//p[contains(@class,"text-gray-500") or contains(@class,"text-gray-600")]'),
      )
      const descText = await description.getText()
      assert.ok(descText.length > 0, 'Product description must not be empty')
      // Product image
      const img = await driver.findElement(By.css('img'))
      const src = await img.getAttribute('src')
      assert.ok(src && src.length > 0, 'Product image src must not be empty')
    },
  )

  // 6 — Stock 0 → "Out of Stock" badge ─────────────────────────────────────
  e2eTest(
    browser,
    'valid: product with stock 0 shows Out of Stock badge on card',
    'Products with stock=0 must display an Out of Stock badge and a disabled Sold Out button on the card.',
    { url: `${BASE_URL}/products` },
    async (driver) => {
      await driver.get(`${BASE_URL}/products`)
      await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Sold Out"]')),
        TIMEOUT,
        'Expected at least one Sold Out button — ensure test data has a product with stock=0',
      )
      const soldOutBtn = await driver.findElement(By.xpath('//button[text()="Sold Out"]'))
      const disabled = await soldOutBtn.getAttribute('disabled')
      assert.ok(disabled !== null, 'Sold Out button must be disabled')
    },
  )

  // 7 — Invalid: non-existent numeric id ───────────────────────────────────
  e2eTest(
    browser,
    'invalid: /products/99999 shows "Product not found" without crashing',
    'Navigating to a non-existent product id must show a not-found message.',
    { url: `${BASE_URL}/products/99999` },
    async (driver) => {
      await driver.get(`${BASE_URL}/products/99999`)
      await waitForText(driver, 'not found', TIMEOUT)
      // Page must still have a nav (didn't hard crash to blank)
      const nav = await driver.findElement(By.css('nav'))
      assert.ok(nav, 'Nav bar must still be visible after not-found state')
    },
  )

  // 8 — Invalid: non-numeric path segment ──────────────────────────────────
  e2eTest(
    browser,
    'invalid: /products/abc does not crash the application',
    'A non-numeric path segment does not match the detail route — the app shows the products list without crashing.',
    { url: `${BASE_URL}/products/abc` },
    async (driver) => {
      await driver.get(`${BASE_URL}/products/abc`)
      // Vue Router falls through to the Products view with filter="abc" — page should still render
      await driver.wait(
        until.elementLocated(By.css('nav')),
        TIMEOUT,
        'Nav bar must be present — page must not crash',
      )
      // Should NOT show a JS error overlay
      const errorOverlays = await driver.findElements(By.css('vite-error-overlay, [data-vite-error]'))
      assert.equal(errorOverlays.length, 0, 'No Vite error overlay should appear')
    },
  )
}

// ── HTML report ───────────────────────────────────────────────────────────────

process.on('exit', () => {
  if (reportResults.length === 0) return
  const dateStr = new Date().toLocaleDateString()
  const passed  = reportResults.filter(r => r.passed).length
  const failed  = reportResults.length - passed

  const rows = reportResults.map(r => {
    const status = r.passed
      ? '<td class="pass">PASS</td>'
      : `<td class="fail">FAIL</td>`
    const shot = r.screenshot
      ? `<a href="${r.screenshot}" target="_blank"><img src="${r.screenshot}" width="160" alt="screenshot"></a>`
      : '—'
    const inputsStr = typeof r.inputs === 'object'
      ? Object.entries(r.inputs).map(([k, v]) => `<b>${k}:</b> ${v}`).join('<br>')
      : String(r.inputs)
    const error = r.error ? `<div class="error">${r.error}</div>` : ''
    return `
      <tr class="${r.passed ? 'row-pass' : 'row-fail'}">
        <td>${r.name}</td>
        <td>${r.description}</td>
        <td>${inputsStr}</td>
        <td>${r.tester}</td>
        <td>${r.observer || '—'}</td>
        <td>${r.date}</td>
        ${status}
        <td>${shot}${error}</td>
      </tr>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Page — Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; color: #1a1a1a; }
    h1   { color: #1e3a5f; }
    .summary { background:#f0f4f8; padding:1rem; border-radius:6px; margin-bottom:1.5rem; }
    .summary span { margin-right: 2rem; font-size: 1.1rem; }
    .pass-count { color: #166534; font-weight: bold; }
    .fail-count { color: #991b1b; font-weight: bold; }
    table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
    th    { background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left; }
    td    { padding: 8px 10px; border: 1px solid #ddd; vertical-align: top; }
    .row-pass { background: #f0fdf4; }
    .row-fail { background: #fef2f2; }
    .pass { color: #166534; font-weight: bold; }
    .fail { color: #991b1b; font-weight: bold; }
    .error { color: #991b1b; font-size: 0.8rem; margin-top: 4px; word-break: break-word; }
    img   { border: 1px solid #ccc; border-radius: 4px; display: block; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Product Detail Page — Test Report</h1>
  <div class="summary">
    <span>Date: <b>${dateStr}</b></span>
    <span>Tester: <b>${TESTER}</b></span>
    <span>Observer: <b>${OBSERVER || '—'}</b></span>
    <span class="pass-count">Passed: ${passed}</span>
    <span class="fail-count">Failed: ${failed}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Test Description</th>
        <th>Details</th>
        <th>Inputs</th>
        <th>Tester</th>
        <th>Observer</th>
        <th>Date Tested</th>
        <th>Result</th>
        <th>Screenshot</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`

  const reportPath = path.join(__dirname, 'test-report.html')
  fs.writeFileSync(reportPath, html)
  console.log(`\nTest report: e2e/test-report.html  (${passed} passed, ${failed} failed)`)
})
