/**
 * Product Reservation — Selenium E2E Tests
 *
 * Prerequisites:
 *   1. cd frontend && npm run dev
 *   2. cd backend  && npm run dev
 *   3. cd e2e && npm install && npm test
 *
 * Environment variables:
 *   BASE_URL       — target URL (default: http://localhost:5173)
 *   TESTER         — name shown in report (default: blank)
 *   OBSERVER       — observer shown in report
 *   BROWSERS       — comma-separated list (default: chrome,firefox)
 *   ADMIN_EMAIL    — admin email
 *   ADMIN_PASSWORD — admin password (required: the Admin → Orders lookup asserts it is set)
 */

const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  Builder,
  By,
  until,
} = require('selenium-webdriver')

const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const fs = require('node:fs')
const path = require('node:path')

const BASE_URL =
  process.env.BASE_URL || 'http://localhost:5173'

const TESTER =
  process.env.TESTER || ''

const OBSERVER =
  process.env.OBSERVER || ''

const BROWSERS =
  (process.env.BROWSERS || 'chrome,firefox')
    .split(',')
    .map(s => s.trim())

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  'admin@skyscrapercomics.com'

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || ''

const TIMEOUT = 15_000

const screenshotsDir = path.join(
  __dirname,
  'screenshots',
)

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, {
    recursive: true,
  })
}

const reportResults = []

// ── Driver helpers ────────────────────────────────────────────────────────────

function buildDriver(browser) {
  if (browser === 'firefox') {
    const opts = new firefox.Options()
      .addArguments(
        '--headless',
        '--width=1280',
        '--height=900',
      )

    return new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(opts)
      .build()
  }

  const opts = new chrome.Options()
    .addArguments(
      '--headless=new',
      '--window-size=1280,900',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    )

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build()
}

async function saveScreenshot(driver, label) {
  const data = await driver.takeScreenshot()

  // Deterministic name: the label already identifies the browser, result and
  // test, so a rerun overwrites its own evidence instead of piling up files.
  const filename = path.join(
    screenshotsDir,
    `${label}.png`,
  )

  fs.writeFileSync(
    filename,
    Buffer.from(data, 'base64'),
  )

  return path.relative(__dirname, filename)
}

function xpathLiteral(value) {
  if (!value.includes("'")) {
    return `'${value}'`
  }

  if (!value.includes('"')) {
    return `"${value}"`
  }

  return `concat('${value.replace(
    /'/g,
    `', "'", '`,
  )}')`
}

async function waitForText(
  driver,
  text,
  timeout = TIMEOUT,
) {
  await driver.wait(
    until.elementLocated(
      By.xpath(
        `//*[contains(text(), ${xpathLiteral(text)})]`,
      ),
    ),
    timeout,
    `Timed out waiting for text: "${text}"`,
  )
}

function stockCount(label) {
  if (/Out of Stock/i.test(label)) {
    return 0
  }

  const match = label.match(
    /(?:In Stock|Limited):\s*(\d+)/i,
  )

  return match ? Number(match[1]) : NaN
}

function formatDeadline(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function firstReservableCard(driver) {
  const reserve = await driver.wait(
    until.elementLocated(
      By.xpath(
        '//button[normalize-space(.)="Reserve"]',
      ),
    ),

    TIMEOUT,

    'No reservable product was found',
  )

  const card = await reserve.findElement(
    By.xpath(
      './ancestor::div[contains(@class,"bg-white")][1]',
    ),
  )

  const productName =
    (
      await card
        .findElement(By.css('h3'))
        .getText()
    ).trim()

  const stockLabel =
    (
      await card
        .findElement(
          By.xpath(
            './/p[' +
            'contains(normalize-space(.),"In Stock:") ' +
            'or contains(normalize-space(.),"Limited:") ' +
            'or normalize-space(.)="Out of Stock"' +
            ']',
          ),
        )
        .getText()
    ).trim()

  const stock = stockCount(stockLabel)

  assert.ok(
    Number.isInteger(stock) && stock > 0,
    `Could not determine positive stock from "${stockLabel}"`,
  )

  return {
    reserve,
    productName,
    stock,
  }
}

async function findCardByName(
  driver,
  productName,
) {
  return driver.wait(
    until.elementLocated(
      By.xpath(
        `//h3[normalize-space(.)=${xpathLiteral(
          productName,
        )}]/ancestor::div[contains(@class,"bg-white")][1]`,
      ),
    ),

    TIMEOUT,

    `Could not find product card for "${productName}"`,
  )
}

async function submitReservationForm(
  driver,
  firstName,
  lastName,
  phone,
) {
  const first = await driver.wait(
    until.elementLocated(
      By.css('input[placeholder="Jane"]'),
    ),
    TIMEOUT,
  )

  const last =
    await driver.findElement(
      By.css('input[placeholder="Doe"]'),
    )

  const phoneInput =
    await driver.findElement(
      By.css('input[type="tel"]'),
    )

  if (firstName) {
    await first.sendKeys(firstName)
  }

  if (lastName) {
    await last.sendKeys(lastName)
  }

  if (phone) {
    await phoneInput.sendKeys(phone)
  }

  const submit =
    await driver.findElement(
      By.xpath(
        '//button[normalize-space(.)="Submit"]',
      ),
    )

  await submit.click()
}

async function loginToAdminIfNeeded(driver) {
  await driver.get(
    `${BASE_URL}/admin/orders`,
  )

  await driver.sleep(250)

  const currentUrl =
    await driver.getCurrentUrl()

  if (
    !currentUrl.includes('/admin/login')
  ) {
    return
  }

  assert.ok(
    ADMIN_PASSWORD,
    'ADMIN_PASSWORD must be set to verify the reservation in Admin → Orders',
  )

  const email = await driver.wait(
    until.elementLocated(
      By.css('input[type="email"]'),
    ),
    TIMEOUT,
  )

  const password = await driver.wait(
    until.elementLocated(
      By.css('input[type="password"]'),
    ),
    TIMEOUT,
  )

  await email.clear()
  await email.sendKeys(ADMIN_EMAIL)

  await password.clear()
  await password.sendKeys(
    ADMIN_PASSWORD,
  )

  const submit = await driver.wait(
    until.elementLocated(
      By.css(
        'button[type="submit"], input[type="submit"]',
      ),
    ),

    TIMEOUT,

    'Admin login submit control was not found',
  )

  await submit.click()

  // Wait for the session flag, not the URL. "/admin/login" also contains
  // "/admin", so a URL check returns immediately and the following
  // driver.get() aborts the in-flight login request before the session is
  // written — which lands the test back on the login page.
  await driver.wait(
    async () =>
      (await driver.executeScript(
        'return window.sessionStorage.getItem("skyscraper-comics-admin-session")',
      )) === 'true',

    TIMEOUT,

    'Admin login did not create a session',
  )

  await driver.get(
    `${BASE_URL}/admin/orders`,
  )
}

// ── Test runner wrapper ───────────────────────────────────────────────────────

function e2eTest(
  browser,
  name,
  description,
  inputs,
  fn,
) {
  test(
    `[${browser}] ${name}`,
    async () => {
      const driver =
        await buildDriver(browser)

      const record = {
        name: `[${browser}] ${name}`,
        description,
        inputs,
        tester: TESTER,
        observer: OBSERVER,
        date:
          new Date().toLocaleDateString(),
        browser,
        passed: false,
        screenshot: null,
        error: null,
      }

      try {
        await fn(driver)

        record.passed = true

        record.screenshot =
          await saveScreenshot(
            driver,
            `pass-${browser}-${name.replace(
              /\W+/g,
              '-',
            )}`,
          )
      } catch (err) {
        record.error = err.message

        try {
          record.screenshot =
            await saveScreenshot(
              driver,
              `fail-${browser}-${name.replace(
                /\W+/g,
                '-',
              )}`,
            )
        } catch {
          // Ignore screenshot failure.
        }

        throw err
      } finally {
        await driver.quit()
        reportResults.push(record)
      }
    },
  )
}

// ── Tests — run for each browser ─────────────────────────────────────────────

for (const browser of BROWSERS) {

  // 1 — Valid reservation + stock decrement + Admin Orders lookup
  e2eTest(
    browser,

    'valid: customer reserves a product and admin can find the reservation',

    'Reserve an in-stock product as John Doe, verify confirmation details and stock decrement, then find the reservation in Admin → Orders by confirmation number.',

    {
      firstName: 'John',
      lastName: 'Doe',
      phone: '916-555-1234',
    },

    async driver => {
      await driver.get(
        `${BASE_URL}/products`,
      )

      const {
        reserve,
        productName,
        stock: stockBefore,
      } =
        await firstReservableCard(
          driver,
        )

      await reserve.click()

      const reservationStartedAt =
        Date.now()

      await submitReservationForm(
        driver,
        'John',
        'Doe',
        '916-555-1234',
      )

      await waitForText(
        driver,
        'Reservation Confirmed!',
      )

      const confirmationEl =
        await driver.findElement(
          By.xpath(
            '//p[normalize-space(.)="Confirmation #"]/following-sibling::p[1]',
          ),
        )

      const confirmation =
        (
          await confirmationEl.getText()
        ).trim()

      assert.match(
        confirmation,
        /^SKY-[A-Z0-9]{6}$/,
      )

      const itemReserved =
        (
          await driver
            .findElement(
              By.xpath(
                '//p[normalize-space(.)="Item Reserved"]/following-sibling::p[1]',
              ),
            )
            .getText()
        ).trim()

      assert.equal(
        itemReserved,
        productName,
      )

      const deadline =
        (
          await driver
            .findElement(
              By.xpath(
                '//p[normalize-space(.)="Pickup Deadline"]/following-sibling::p[1]',
              ),
            )
            .getText()
        ).trim()

      const expected = [
        formatDeadline(
          new Date(
            reservationStartedAt +
              48 * 60 * 60 * 1000,
          ),
        ),

        formatDeadline(
          new Date(
            reservationStartedAt +
              48 * 60 * 60 * 1000 +
              60_000,
          ),
        ),
      ]

      assert.ok(
        expected.includes(deadline),
        `Pickup deadline "${deadline}" should be approximately 48 hours after reservation`,
      )

      const done =
        await driver.findElement(
          By.xpath(
            '//button[normalize-space(.)="Done"]',
          ),
        )

      await done.click()

      const updatedCard =
        await findCardByName(
          driver,
          productName,
        )

      await driver.wait(
        async () => {
          const stockText =
            (
              await updatedCard
                .findElement(
                  By.xpath(
                    './/p[' +
                    'contains(normalize-space(.),"In Stock:") ' +
                    'or contains(normalize-space(.),"Limited:") ' +
                    'or normalize-space(.)="Out of Stock"' +
                    ']',
                  ),
                )
                .getText()
            ).trim()

          return (
            stockCount(stockText) ===
            stockBefore - 1
          )
        },

        TIMEOUT,

        'Product stock did not decrement by 1 after reservation',
      )

      await loginToAdminIfNeeded(
        driver,
      )

      const search =
        await driver.wait(
          until.elementLocated(
            By.css(
              'input[placeholder="Search by confirmation #"]',
            ),
          ),
          TIMEOUT,
        )

      await search.clear()
      await search.sendKeys(
        confirmation,
      )

      await waitForText(
        driver,
        confirmation,
      )

      const row =
        await driver.findElement(
          By.xpath(
            `//td[normalize-space(.)=${xpathLiteral(
              confirmation,
            )}]/ancestor::tr[1]`,
          ),
        )

      const rowText =
        await row.getText()

      assert.ok(
        rowText.includes('John Doe'),
        'Admin order row must show customer John Doe',
      )

      assert.ok(
        rowText.includes(
          productName,
        ),
        'Admin order row must show the reserved product',
      )

      assert.ok(
        rowText.includes(
          '(916) 555-1234',
        ),
        'Admin order row must show the formatted phone number',
      )
    },
  )

  // 2 — Required field validation
  e2eTest(
    browser,

    'invalid: reservation form requires first name, last name, and phone',

    'Submit an empty reservation form and verify all required-field messages.',

    {
      firstName: '',
      lastName: '',
      phone: '',
    },

    async driver => {
      await driver.get(
        `${BASE_URL}/products`,
      )

      const { reserve } =
        await firstReservableCard(
          driver,
        )

      await reserve.click()

      await submitReservationForm(
        driver,
        '',
        '',
        '',
      )

      await waitForText(
        driver,
        'First name is required.',
      )

      await waitForText(
        driver,
        'Last name is required.',
      )

      await waitForText(
        driver,
        'Phone number is required.',
      )
    },
  )

  // 3 — Invalid phone
  e2eTest(
    browser,

    'invalid: reservation form rejects a non-10-digit US phone number',

    'Submit John Doe with phone 12345 and verify the exact phone validation message.',

    {
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345',
    },

    async driver => {
      await driver.get(
        `${BASE_URL}/products`,
      )

      const { reserve } =
        await firstReservableCard(
          driver,
        )

      await reserve.click()

      await submitReservationForm(
        driver,
        'John',
        'Doe',
        '12345',
      )

      await waitForText(
        driver,
        'Enter a valid 10-digit US phone number.',
      )
    },
  )

  // 4 — Sold-out product UI
  e2eTest(
    browser,

    'invalid: sold-out product cannot be opened for reservation',

    'Verify a stock-0 product displays Sold Out and the reservation button is disabled. The backend test separately verifies the exact sold-out response message.',

    {
      stock: 0,
      expected: 'Sold Out',
    },

    async driver => {
      await driver.get(
        `${BASE_URL}/products`,
      )

      const soldOut =
        await driver.wait(
          until.elementLocated(
            By.xpath(
              '//button[normalize-space(.)="Sold Out"]',
            ),
          ),

          TIMEOUT,

          'Expected at least one sold-out product',
        )

      const disabled =
        await soldOut.getAttribute(
          'disabled',
        )

      assert.ok(
        disabled !== null,
        'Sold Out button must be disabled',
      )

      const card =
        await soldOut.findElement(
          By.xpath(
            './ancestor::div[contains(@class,"bg-white")][1]',
          ),
        )

      const stockLabel =
        await card.findElement(
          By.xpath(
            './/*[normalize-space(.)="Out of Stock"]',
          ),
        )

      assert.ok(
        stockLabel,
        'Sold-out product must show Out of Stock',
      )
    },
  )
}

// ── HTML report ───────────────────────────────────────────────────────────────

process.on('exit', () => {
  if (
    reportResults.length === 0
  ) {
    return
  }

  const dateStr =
    new Date().toLocaleDateString()

  const passed =
    reportResults.filter(
      r => r.passed,
    ).length

  const failed =
    reportResults.length - passed

  const rows =
    reportResults
      .map(r => {
        const status =
          r.passed
            ? '<td class="pass">PASS</td>'
            : '<td class="fail">FAIL</td>'

        const shot =
          r.screenshot
            ? `<a href="${r.screenshot}" target="_blank"><img src="${r.screenshot}" width="160" alt="screenshot"></a>`
            : '—'

        const inputsStr =
          typeof r.inputs === 'object'
            ? Object.entries(r.inputs)
                .map(
                  ([k, v]) =>
                    `<b>${k}:</b> ${v}`,
                )
                .join('<br>')
            : String(r.inputs)

        const error =
          r.error
            ? `<div class="error">${r.error}</div>`
            : ''

        return `
          <tr class="${
            r.passed
              ? 'row-pass'
              : 'row-fail'
          }">
            <td>${r.name}</td>
            <td>${r.description}</td>
            <td>${inputsStr}</td>
            <td>${r.tester}</td>
            <td>${r.observer || '—'}</td>
            <td>${r.date}</td>
            ${status}
            <td>${shot}${error}</td>
          </tr>`
      })
      .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Reservation — Test Report</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 2rem;
      color: #1a1a1a;
    }

    h1 {
      color: #1e3a5f;
    }

    .summary {
      background: #f0f4f8;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
    }

    .summary span {
      margin-right: 2rem;
      font-size: 1.1rem;
    }

    .pass-count {
      color: #166534;
      font-weight: bold;
    }

    .fail-count {
      color: #991b1b;
      font-weight: bold;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 0.85rem;
    }

    th {
      background: #1e3a5f;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
    }

    td {
      padding: 8px 10px;
      border: 1px solid #ddd;
      vertical-align: top;
    }

    .row-pass {
      background: #f0fdf4;
    }

    .row-fail {
      background: #fef2f2;
    }

    .pass {
      color: #166534;
      font-weight: bold;
    }

    .fail {
      color: #991b1b;
      font-weight: bold;
    }

    .error {
      color: #991b1b;
      font-size: 0.8rem;
      margin-top: 4px;
      word-break: break-word;
    }

    img {
      border: 1px solid #ccc;
      border-radius: 4px;
      display: block;
      margin-top: 4px;
    }
  </style>
</head>

<body>
  <h1>Product Reservation — Test Report</h1>

  <div class="summary">
    <span>
      Date:
      <b>${dateStr}</b>
    </span>

    <span>
      Tester:
      <b>${TESTER}</b>
    </span>

    <span>
      Observer:
      <b>${OBSERVER || '—'}</b>
    </span>

    <span class="pass-count">
      Passed: ${passed}
    </span>

    <span class="fail-count">
      Failed: ${failed}
    </span>
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

  const reportPath =
    path.join(
      __dirname,
      'reservation-test-report.html',
    )

  fs.writeFileSync(
    reportPath,
    html,
  )

  console.log(
    `\nTest report: e2e/reservation-test-report.html (${passed} passed, ${failed} failed)`,
  )
})