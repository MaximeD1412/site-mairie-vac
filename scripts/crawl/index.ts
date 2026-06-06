import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { writeFile, appendFile } from 'node:fs/promises'
import path from 'node:path'
import { extractLinks, extractFiles, extractTitle, classifyPage, shouldSkip, toCsvLine } from './crawler'

const SUBDIRS = { pdf: 'pdf', image: 'images', doc: 'docs' } as const

async function downloadFile(url: string, outputDir: string, type: keyof typeof SUBDIRS): Promise<void> {
  const subdir = path.join(outputDir, SUBDIRS[type])
  mkdirSync(subdir, { recursive: true })
  const filename = path.basename(new URL(url).pathname)
  const dest = path.join(subdir, filename)
  if (existsSync(dest)) return
  const res = await fetch(url)
  if (!res.ok) { console.error(`  ✗ ${res.status} ${url}`); return }
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buffer)
  console.log(`  ↓ ${type}/${filename}`)
}

async function crawl(rootUrl: string, outputDir: string): Promise<void> {
  const csvPath = path.join(outputDir, 'pages-inventory.csv')
  mkdirSync(outputDir, { recursive: true })
  await writeFile(csvPath, 'url,title,type\n')

  const visited = new Set<string>()
  const queue: string[] = [rootUrl]

  while (queue.length > 0) {
    const url = queue.shift()!
    if (shouldSkip(url, rootUrl, visited)) continue
    visited.add(url)

    let html: string
    try {
      console.log(`→ ${url}`)
      const res = await fetch(url)
      if (!res.ok) { console.error(`  ✗ ${res.status}`); continue }
      html = await res.text()
    } catch (err) {
      console.error(`  ✗ fetch error: ${err}`)
      continue
    }

    const title = extractTitle(html)
    const type = classifyPage(url, html)
    await appendFile(csvPath, toCsvLine({ url, title, type }) + '\n')

    const files = extractFiles(html, url)
    for (const file of files) {
      await downloadFile(file.url, outputDir, file.type)
    }

    const links = extractLinks(html, url)
    for (const link of links) {
      if (!shouldSkip(link, rootUrl, visited)) queue.push(link)
    }
  }

  console.log(`\nTerminé. ${visited.size} pages crawlées → ${csvPath}`)
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [,, rootUrl, outputDir = './crawl-output'] = process.argv

if (!rootUrl) {
  console.error('Usage: node --experimental-strip-types scripts/crawl/index.ts <URL> [output-dir]')
  process.exit(1)
}

try {
  new URL(rootUrl)
} catch {
  console.error(`URL invalide : ${rootUrl}`)
  process.exit(1)
}

await crawl(rootUrl, outputDir)
