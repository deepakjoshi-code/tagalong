// Renders public/icons/icon.svg to the PNG sizes the manifest needs, using the bundled Chromium.
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.resolve(here, '../public/icons')
const svg = readFileSync(path.join(iconsDir, 'icon.svg'), 'utf8')

const candidates = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
]
const executablePath = candidates.find((p) => existsSync(p))
const browser = await chromium.launch(executablePath ? { executablePath } : {})
const page = await browser.newPage({ deviceScaleFactor: 1 })

async function render(size, file, { padding = 0, background = 'transparent' } = {}) {
  await page.setViewportSize({ width: size, height: size })
  const inner = size - padding * 2
  await page.setContent(
    `<html><body style="margin:0;background:${background};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
      <div style="width:${inner}px;height:${inner}px">${svg.replace('width="512" height="512"', `width="${inner}" height="${inner}"`)}</div>
    </body></html>`,
  )
  const buf = await page.screenshot({ omitBackground: background === 'transparent', clip: { x: 0, y: 0, width: size, height: size } })
  writeFileSync(path.join(iconsDir, file), buf)
  console.log('wrote', file)
}

await render(192, 'icon-192.png')
await render(512, 'icon-512.png')
await render(180, 'apple-touch-icon.png')
// Maskable: safe zone is the central 80%, so pad the artwork on a solid background.
await render(512, 'icon-maskable-512.png', { padding: 64, background: '#FF6A3D' })
await browser.close()
