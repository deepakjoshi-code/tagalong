import { expect, test, type Page } from '@playwright/test'

const SHOTS = 'e2e/__screenshots__'

/** Skips onboarding and turns demo mode on, so flows work without hardware. */
async function seedDemo(page: Page) {
  await page.addInitScript(() => {
    // Seed the persisted store before the app boots.
    const payload = {
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
        events: [],
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
    const open = indexedDB.open('keyval-store', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('keyval')
    open.onsuccess = () => {
      const tx = open.result.transaction('keyval', 'readwrite')
      tx.objectStore('keyval').put(JSON.stringify(payload), 'tagalong:v1')
    }
  })
}

test('onboarding runs and lands on an empty home', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Give anything a voice.' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/01-welcome.png` })
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Made for kids. Private by design.' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/02-welcome-privacy.png` })
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  await page.getByRole('button', { name: 'Get started' }).click()
  await expect(page.getByRole('heading', { name: 'Find your tag' })).toBeVisible()
  await page.goto('/tags')
  await expect(page.getByRole('heading', { name: 'Tags', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No tags yet' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/03-home-empty.png` })
})

test('add-tag wizard completes with a demo tag', async ({ page }) => {
  await page.addInitScript(() => {
    const payload = {
      state: { kids: [], tags: [], events: [], settings: { onboarded: true, appearance: 'system', haptics: true, demoMode: true, eventLogEnabled: true, retentionDays: 7 } },
      version: 1,
    }
    const open = indexedDB.open('keyval-store', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('keyval')
    open.onsuccess = () => {
      const tx = open.result.transaction('keyval', 'readwrite')
      tx.objectStore('keyval').put(JSON.stringify(payload), 'tagalong:v1')
    }
  })
  await page.goto('/tags/new')
  await expect(page.getByRole('heading', { name: 'Find your tag' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/04-wizard-find.png` })
  await page.getByRole('button', { name: 'Create a demo tag' }).click()

  await expect(page.getByRole('heading', { name: /Who.s it for\?/ })).toBeVisible({ timeout: 15000 })
  await page.getByLabel('First name (optional)').fill('Ava')
  await page.getByRole('button', { name: /^Kid/ }).click()
  await page.screenshot({ path: `${SHOTS}/05-wizard-kid.png` })
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: /What.s it attached to\?/ })).toBeVisible()
  await page.getByRole('button', { name: 'Water bottle' }).click()
  await page.screenshot({ path: `${SHOTS}/06-wizard-thing.png` })
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: 'Pick a personality' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/07-wizard-personality.png` })
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: 'Sound' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/08-wizard-sound.png` })
  await page.getByRole('button', { name: 'Send to tag' }).click()

  await expect(page.getByRole('heading', { name: /is ready!/ })).toBeVisible({ timeout: 20000 })
  await page.screenshot({ path: `${SHOTS}/09-wizard-done.png` })
})

test('tag detail, kids, settings and privacy render from seeded data', async ({ page }) => {
  await seedDemo(page)
  await page.goto('/tags')
  await expect(page.getByText('Bottle Buddy')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/10-home-with-tag.png` })

  await page.getByText('Bottle Buddy').click()
  await expect(page.getByRole('heading', { name: 'Bottle Buddy' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/11-tag-detail.png`, fullPage: true })

  await page.goto('/kids')
  await expect(page.getByText('Ava')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/12-kids.png` })

  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/13-settings.png`, fullPage: true })

  await page.goto('/settings/privacy')
  await expect(page.getByRole('heading', { name: 'Privacy Center' })).toBeVisible()
  await expect(page.getByText('What Tagalong knows')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/14-privacy.png`, fullPage: true })
})

test('demo playground speaks a line for each control', async ({ page }) => {
  await seedDemo(page)
  await page.goto('/demo')
  await expect(page.getByRole('heading', { name: 'Playground' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/15-demo-idle.png` })

  await page.getByRole('button', { name: 'Fill' }).click()
  await expect(page.getByTestId('speech-bubble')).toContainText('\u201c')
  await page.screenshot({ path: `${SHOTS}/16-demo-filled.png` })

  await page.getByRole('button', { name: 'Drop' }).click()
  await expect(page.getByText('Took a tumble')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/17-demo-drop.png`, fullPage: true })
})

test('dark mode renders', async ({ page }) => {
  await seedDemo(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/tags')
  await expect(page.getByText('Bottle Buddy')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/18-home-dark.png` })
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Fill' }).click()
  await page.screenshot({ path: `${SHOTS}/19-demo-dark.png` })
})
