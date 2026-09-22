import { expect, test, type Page } from '@playwright/test'

/**
 * Design and accessibility gates. These encode the bar the design spec sets:
 * nothing overflows on a small phone, every control is thumb-sized, every icon
 * button has a name, and every screen has exactly one top-level heading.
 */

const SEED = {
  state: {
    kids: [{ id: 'kid-1', displayName: 'Ava', ageBand: 'kid', createdAt: 1758500000000 }],
    tags: [
      {
        id: 'tag-1',
        deviceId: 'sim-demo',
        nickname: 'Bottle Buddy',
        thing: 'bottle',
        kidId: 'kid-1',
        personality: 'silly',
        volume: 70,
        quiet: { enabled: true, startMin: 1200, endMin: 420 },
        nudges: false,
        language: 'en',
        createdAt: 1758500000000,
        simulated: true,
        info: { fw: '0.9.0', hw: 1, packId: 1, packVersion: 1, battery: 86 },
      },
    ],
    events: [{ id: 'ev-1', tagId: 'tag-1', type: 'drop', at: 1758500000000 }],
    settings: {
      onboarded: true,
      appearance: 'system',
      haptics: true,
      demoMode: true,
      eventLogEnabled: true,
      retentionDays: 7,
    },
  },
  version: 1,
}

async function seed(page: Page) {
  await page.addInitScript((payload) => {
    const open = indexedDB.open('keyval-store', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('keyval')
    open.onsuccess = () => {
      const tx = open.result.transaction('keyval', 'readwrite')
      tx.objectStore('keyval').put(JSON.stringify(payload), 'tagalong:v1')
    }
  }, SEED)
}

const ROUTES = [
  { path: '/welcome', name: 'Welcome' },
  { path: '/tags', name: 'Tags' },
  { path: '/tags/tag-1', name: 'Tag detail' },
  { path: '/tags/new', name: 'Add tag' },
  { path: '/kids', name: 'Kids' },
  { path: '/kids/kid-1', name: 'Kid editor' },
  { path: '/settings', name: 'Settings' },
  { path: '/settings/privacy', name: 'Privacy Center' },
  { path: '/settings/about', name: 'About' },
  { path: '/demo', name: 'Demo' },
]

// 320px is the narrowest phone still in real use; 430 is a large modern phone.
const WIDTHS = [320, 390, 430]

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await seed(page)
    await page.setViewportSize({ width, height: 844 })
    const offenders: string[] = []

    for (const route of ROUTES) {
      await page.goto(route.path)
      await page.waitForTimeout(250)
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        const scrollable = doc.scrollWidth > doc.clientWidth + 1
        if (!scrollable) return null
        // Name the widest offending element so a failure is actionable.
        let worst = ''
        let worstRight = doc.clientWidth
        for (const el of Array.from(document.querySelectorAll('*'))) {
          const r = el.getBoundingClientRect()
          if (r.right > worstRight) {
            worstRight = r.right
            worst = `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)}`
          }
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, worst }
      })
      if (overflow) {
        offenders.push(
          `${route.name} (${route.path}): scrolls to ${overflow.scrollWidth}px in ${overflow.clientWidth}px — widest: ${overflow.worst}`,
        )
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([])
  })
}

test('every route has exactly one top-level heading', async ({ page }) => {
  await seed(page)
  const problems: string[] = []
  for (const route of ROUTES) {
    await page.goto(route.path)
    await page.waitForTimeout(200)
    const count = await page.locator('h1').count()
    if (count !== 1) problems.push(`${route.name} (${route.path}) has ${count} h1 elements`)
  }
  expect(problems, problems.join('\n')).toEqual([])
})

test('every interactive control has an accessible name', async ({ page }) => {
  await seed(page)
  const problems: string[] = []
  for (const route of ROUTES) {
    await page.goto(route.path)
    await page.waitForTimeout(200)
    const unnamed = await page.evaluate(() => {
      const out: string[] = []
      const nodes = document.querySelectorAll('button, a[href], input, [role="switch"], [role="radio"]')
      for (const el of Array.from(nodes)) {
        const text = (el.textContent ?? '').trim()
        const aria = el.getAttribute('aria-label') ?? ''
        const labelled = el.getAttribute('aria-labelledby') ?? ''
        const title = el.getAttribute('title') ?? ''
        const id = el.getAttribute('id')
        const hasLabelEl = id ? !!document.querySelector(`label[for="${CSS.escape(id)}"]`) : false
        if (!text && !aria && !labelled && !title && !hasLabelEl) {
          out.push(`${el.tagName.toLowerCase()}[class=${(el.className || '').toString().slice(0, 30)}]`)
        }
      }
      return out
    })
    for (const u of unnamed) problems.push(`${route.name}: ${u}`)
  }
  expect(problems, problems.join('\n')).toEqual([])
})

test('tap targets are at least 44px tall', async ({ page }) => {
  await seed(page)
  const problems: string[] = []
  for (const route of ROUTES) {
    await page.goto(route.path)
    await page.waitForTimeout(200)
    const small = await page.evaluate(() => {
      const out: string[] = []
      for (const el of Array.from(document.querySelectorAll('button, a[href]'))) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue // hidden
        if (r.height < 44) {
          const label = (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30)
          out.push(`"${label}" is ${Math.round(r.height)}px tall`)
        }
      }
      return out
    })
    for (const s of small) problems.push(`${route.name}: ${s}`)
  }
  expect(problems, problems.join('\n')).toEqual([])
})

test('the app is installable as a PWA', async ({ page }) => {
  await page.goto('/tags')
  const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href')
  expect(manifestHref).toBeTruthy()
  const manifest = await page.evaluate(async (href) => {
    const res = await fetch(href!)
    return res.json()
  }, manifestHref)
  expect(manifest.name).toBe('Tagalong')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3)
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  // A registered service worker is what makes it work offline.
  const sw = await page.evaluate(() => navigator.serviceWorker?.getRegistrations().then((r) => r.length))
  expect(sw).toBeGreaterThan(0)
})

test('the app makes no third-party network requests', async ({ page }) => {
  const external: string[] = []
  page.on('request', (req) => {
    const url = new URL(req.url())
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) external.push(req.url())
  })
  await seed(page)
  for (const route of ROUTES) {
    await page.goto(route.path)
    await page.waitForTimeout(200)
  }
  expect(external, `Tagalong must not talk to anyone (ADR-002):\n${external.join('\n')}`).toEqual([])
})
