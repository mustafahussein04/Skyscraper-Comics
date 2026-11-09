import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const api = 'http://127.0.0.1:3101/api/products'
const image = '/images/product/product-01.jpg'
const imageFile = fileURLToPath(new URL('../../public/images/product/product-01.jpg', import.meta.url))
const valid = { name: 'SCRUM-174 Comic', description: 'System test comic book.', type: 'comics', brand: 'Marvel', price: 4.99, stock: 10, image }
const invalid = [
  { field: 'name', selector: '#prod-name', value: '', error: 'Product name is required.' },
  { field: 'description', selector: '#prod-desc', value: '', error: 'Description is required.' },
  { field: 'brand', selector: '#prod-brand', value: '', error: 'Brand is required.' },
  { field: 'price', selector: '#prod-price', value: '-5', error: 'Price must be a valid non-negative number.' },
  { field: 'price', selector: '#prod-price', value: 'abc', error: 'Price must be a valid non-negative number.' },
  { field: 'stock', selector: '#prod-stock', value: '2.5', error: 'Stock must be a non-negative whole number.' },
  { field: 'stock', selector: '#prod-stock', value: '-1', error: 'Stock must be a non-negative whole number.' },
]

async function openAdd(page: Page, name: string) {
  await page.goto('/admin/products')
  await page.getByRole('button', { name: 'Add New Product', exact: true }).click()
  await page.locator('#prod-name').fill(name)
  await page.locator('#prod-desc').fill(valid.description)
  await page.locator('#prod-type').selectOption('comics')
  await page.locator('#prod-brand').fill(valid.brand)
  await page.locator('#prod-price').fill('4.99')
  await page.locator('#prod-stock').fill('10')
  await page.locator('#prod-image').setInputFiles(imageFile)
}

async function screenshot(page: Page, name: string) {
  const file = test.info().outputPath(`${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  await test.info().attach(name, { path: file, contentType: 'image/png' })
}

test.beforeEach(async ({ page }, info) => {
  info.annotations.push({ type: 'story', description: 'SCRUM-174' })
  await page.goto('/admin/login')
  await page.getByLabel('Email Address').fill('scrum174@example.test')
  await page.getByLabel('Password', { exact: true }).fill('SCRUM174-test-only')
  await page.getByRole('button', { name: 'Sign in to Admin Portal' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  info.annotations.push({ type: 'browser-version', description: page.context().browser()!.version() })
})

test('add, edit price/stock, and delete across admin, public list, and detail (uploaded image)', async ({ page, request }) => {
  const name = `${valid.name} ${test.info().project.name} ${Date.now()}`
  let id: number | undefined
  try {
    await openAdd(page, name)
    const created = page.waitForResponse(r => r.url() === api && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Add Product', exact: true }).click()
    const response = await created
    expect(response.status()).toBe(201)
    const product = await response.json()
    id = product.id
    const uploadedImage = product.image
    expect(uploadedImage).toContain('/api/uploads/products/')
    const storedImage = await request.get(uploadedImage)
    expect(storedImage.ok()).toBe(true)
    expect(await storedImage.body()).toEqual(readFileSync(imageFile))
    const row = page.locator('div.flex.items-center.justify-between.py-4').filter({ hasText: name })
    await expect(row).toContainText('$4.99')
    await expect(row).toContainText('Stock: 10')
    await screenshot(page, '01-added-admin')
    await page.reload()
    await expect(row).toContainText(name)

    const verifyPublic = async (price: string, stock: string, phase: string) => {
      await page.goto('/products')
      await page.getByPlaceholder('Search products...').fill(name)
      const card = page.locator('div.bg-white.p-4').filter({ hasText: name })
      await expect(card).toContainText(price)
      await expect(card).toContainText(stock)
      await expect(card).toContainText(valid.description)
      await expect(card.getByRole('img', { name, exact: true })).toHaveAttribute('src', uploadedImage)
      await expect.poll(() => card.getByRole('img', { name, exact: true }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
      await screenshot(page, `${phase}-public-card`)
      await page.goto(`/products/${id}`)
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
      await expect(page.getByText(price, { exact: true })).toBeVisible()
      await expect(page.getByText('In Stock', { exact: true })).toBeVisible()
      const detailImage = page.getByRole('img', { name, exact: true })
      await expect(detailImage).toHaveAttribute('src', uploadedImage)
      await expect.poll(() => detailImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
      await screenshot(page, `${phase}-public-detail`)
    }
    await verifyPublic('$4.99', 'In Stock: 10', '02-added')
    await page.goto('/admin/products')
    await row.getByRole('button', { name: 'Edit', exact: true }).click()
    const edit = page.locator('form')
    await edit.locator('input[type=number]').nth(0).fill('6.99')
    await edit.locator('input[type=number]').nth(1).fill('3')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(row).toContainText('$6.99')
    await expect(row).toContainText('Stock: 3')
    await screenshot(page, '03-edited-admin')
    await page.reload()
    await expect(row).toContainText('$6.99')
    await verifyPublic('$6.99', 'Limited: 3', '04-edited')

    await page.goto('/admin/products')
    await row.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.locator('div.fixed').getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(row).toHaveCount(0)
    await page.reload()
    await expect(row).toHaveCount(0)
    await screenshot(page, '05-deleted-admin')
    const publicList = page.waitForResponse(r => r.url() === api && r.request().method() === 'GET')
    await page.goto('/products')
    const publicResponse = await publicList
    expect(publicResponse.ok()).toBe(true)
    expect((await publicResponse.json()).some((product: { id: number }) => product.id === id)).toBe(false)
    await page.getByPlaceholder('Search products...').fill(name)
    await expect(page.getByText('Loading products...', { exact: true })).toHaveCount(0)
    await expect(page.locator('div.bg-white.p-4').filter({ hasText: name })).toHaveCount(0)
    await screenshot(page, '06-deleted-public')
    await page.goto(`/products/${id}`)
    await expect(page.getByText('Product not found.', { exact: true })).toBeVisible()
    expect((await request.get(`${api}/${id}`)).status()).toBe(404)
    await screenshot(page, '07-deleted-detail')
  } finally {
    if (id) await request.delete(`${api}/${id}`)
  }
})

for (const item of invalid) {
  test(`add rejects ${item.field}=${JSON.stringify(item.value)} with exact message`, async ({ page, request }) => {
    const name = `${valid.name} invalid ${Date.now()}`
    await openAdd(page, name)
    const input = page.locator(item.selector)
    if (item.value === 'abc') {
      // A number input rejects nonnumeric text; type through the keyboard to test the real UI.
      await input.fill('')
      await input.pressSequentially('abc')
    } else await input.fill(item.value)
    await page.getByRole('button', { name: 'Add Product', exact: true }).click()
    await screenshot(page, 'validation')
    await test.info().attach('native-validation', {
      body: JSON.stringify(await input.evaluate((el: HTMLInputElement) => ({ value: el.value, message: el.validationMessage })), null, 2),
      contentType: 'application/json',
    })
    // Record any unintended creation and clean up only this case's unique data.
    const found = await (await request.get(`${api}?search=${encodeURIComponent(name)}`)).json()
    for (const product of found) await request.delete(`${api}/${product.id}`)
    expect.soft(found).toHaveLength(0)
    await expect(page.getByText(item.error, { exact: true })).toBeVisible()
  })
}

test('POST and PUT reject every specified invalid input without changing persisted data', async ({ request }) => {
  const createdResponse = await request.post(api, { data: valid })
  expect(createdResponse.status()).toBe(201)
  const created = await createdResponse.json()
  try {
    const before = await (await request.get(api)).json()
    for (const item of invalid) {
      const data = { ...valid, [item.field]: item.value }
      for (const method of ['post', 'put'] as const) {
        const response = await request[method](method === 'post' ? api : `${api}/${created.id}`, { data })
        expect(response.status()).toBe(400)
        expect(await response.json()).toEqual({ error: item.error })
      }
    }
    expect(await (await request.get(api)).json()).toEqual(before)
  } finally {
    await request.delete(`${api}/${created.id}`)
  }
})

test('uploaded image renders on product card and detail', async ({ page, request }) => {
  const name = `${valid.name} upload ${Date.now()}`
  await openAdd(page, name)
  await expect(page.getByRole('img', { name: 'Selected product preview', exact: true })).toBeVisible()
  await screenshot(page, 'image-upload-form')
  const upload = page.locator('input[type=file]')
  await expect(upload, 'Acceptance criterion requires file upload; an Image URL field alone is insufficient.').toHaveCount(1)
  let id: number | undefined
  try {
    const created = page.waitForResponse(r => r.url() === api && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Add Product', exact: true }).click()
    const response = await created
    expect(response.status()).toBe(201)
    const product = await response.json()
    id = product.id
    expect(product.image).toContain('/api/uploads/products/')
    const storedImage = await request.get(product.image)
    expect(storedImage.ok()).toBe(true)
    expect(await storedImage.body()).toEqual(readFileSync(imageFile))
    for (const route of ['/products', `/products/${id}`]) {
      await page.goto(route)
      const img = page.getByRole('img', { name, exact: true })
      await expect(img).toHaveAttribute('src', product.image)
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
      await screenshot(page, route === '/products' ? 'uploaded-card' : 'uploaded-detail')
    }
  } finally {
    if (id) await request.delete(`${api}/${id}`)
  }
})
