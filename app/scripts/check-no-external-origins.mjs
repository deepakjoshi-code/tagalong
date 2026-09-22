#!/usr/bin/env node
/**
 * Privacy guard (ADR-002): the built app must not be able to reach a third party
 * at runtime. Scans every built file for URLs that the browser could actually
 * fetch — src/href/url()/import/fetch targets — and fails if any points off-origin.
 *
 * Doc links inside dependency error strings (react.dev, reactrouter.com, …) are
 * not fetchable, so they are allowed; a <script src> or a font stylesheet is not.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist')
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.map'])

/** Only these contexts can cause a network fetch. */
const FETCH_PATTERNS = [
  /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi, // HTML attributes
  /\burl\(\s*["']?([^"')]+)["']?\s*\)/gi, // CSS url()
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, // dynamic import
  /\bfrom\s*["']((?:https?:)?\/\/[^"']+)["']/g, // static import from an absolute URL
  /\bfetch\s*\(\s*["']([^"']+)["']/g, // fetch literal
  /\bimportScripts\s*\(\s*["']([^"']+)["']/g, // worker
  /\bnew\s+(?:Worker|EventSource|WebSocket)\s*\(\s*["']([^"']+)["']/g,
]

const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1'])
/** Namespaces that are identifiers, never fetched. */
const NAMESPACE_PREFIXES = ['http://www.w3.org/', 'http://www.mozilla.org/', 'http://purl.org/']

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const offenders = []
for (const file of walk(root)) {
  if (!TEXT.has(extname(file))) continue
  const text = readFileSync(file, 'utf8')
  for (const pattern of FETCH_PATTERNS) {
    pattern.lastIndex = 0
    let m
    while ((m = pattern.exec(text)) !== null) {
      const raw = (m[1] ?? '').trim()
      if (!raw) continue
      if (!/^(https?:)?\/\//i.test(raw)) continue // relative, data:, blob: — all same-origin or inline
      if (NAMESPACE_PREFIXES.some((p) => raw.startsWith(p))) continue
      let host
      try {
        host = new URL(raw.startsWith('//') ? `https:${raw}` : raw).hostname
      } catch {
        continue
      }
      if (ALLOWED_HOSTS.has(host)) continue
      offenders.push(`${file.slice(root.length + 1)}: ${raw}`)
    }
  }
}

if (offenders.length) {
  console.error('Third-party origins found in the built app (see ADR-002):')
  for (const o of [...new Set(offenders)]) console.error(`  ${o}`)
  process.exit(1)
}
console.log('✓ No fetchable third-party origins in the build.')
