#!/usr/bin/env node
// Validates every phrase pack against the content guidelines. Exits non-zero on failure.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packsDir = join(dirname(fileURLToPath(import.meta.url)), 'packs')
const LIMITS = { little: 6, kid: 10, big: 12 }
const BANDS = ['little', 'kid', 'big']
const PERSONALITIES = ['silly', 'sweet', 'brave']
const META_KEYS = new Set(['thing', 'language', 'version'])

let lines = 0
const problems = []

for (const file of readdirSync(packsDir).filter((f) => f.endsWith('.json')).sort()) {
  let pack
  try {
    pack = JSON.parse(readFileSync(join(packsDir, file), 'utf8'))
  } catch (e) {
    problems.push(`${file}: invalid JSON — ${e.message}`)
    continue
  }
  if (!pack.thing || !pack.language || !pack.version) problems.push(`${file}: missing thing/language/version`)

  for (const [section, events] of Object.entries(pack)) {
    if (META_KEYS.has(section)) continue
    for (const [event, bands] of Object.entries(events)) {
      for (const band of BANDS) {
        if (!bands[band]) {
          problems.push(`${file} ${section}.${event}: missing band "${band}"`)
          continue
        }
        for (const personality of PERSONALITIES) {
          const where = `${file} ${section}.${event}.${band}.${personality}`
          const list = bands[band][personality]
          if (!Array.isArray(list)) {
            problems.push(`${where}: missing or not an array`)
            continue
          }
          if (list.length < 4 || list.length > 6) problems.push(`${where}: ${list.length} lines (want 4–6)`)
          if (new Set(list).size !== list.length) problems.push(`${where}: duplicate lines`)
          let named = 0
          for (const line of list) {
            lines++
            if (line.includes('{{name}}')) named++
            const words = line.replace(/\{\{name\}\}/g, 'x').trim().split(/\s+/).length
            if (words > LIMITS[band]) problems.push(`${where}: ${words} words (max ${LIMITS[band]}) — "${line}"`)
            if (/[^\x20-\x7E‘’“”—]/.test(line)) problems.push(`${where}: non-English characters — "${line}"`)
            if (line.length > 90) problems.push(`${where}: too long to record — "${line}"`)
          }
          if (named > Math.ceil(list.length / 2)) problems.push(`${where}: ${named}/${list.length} lines use {{name}} (max half)`)
        }
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\n${problems.length} problem(s) across ${lines} lines`)
  process.exit(1)
}
console.log(`✓ ${lines} lines valid across all packs`)
