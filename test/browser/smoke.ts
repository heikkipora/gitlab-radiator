import {after, before, describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {spawn, type ChildProcess} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {firefox, type Browser, type Page} from 'playwright'

const PORT = 4567
const BUILD_DIR = path.resolve(import.meta.dirname, '../../build')

const CONFIG = `
interval: 5
port: ${PORT}
gitlabs:
  - url: https://gitlab.com
    access-token: glpat-kC8nLT6EZqYfbcv6WHqg
    projects:
      include: ".*integration-test-project-1"
`

function startServer(configFile: string): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['bin/gitlab-radiator.js'], {
      cwd: BUILD_DIR,
      env: {...process.env, GITLAB_RADIATOR_CONFIG: configFile}
    })
    server.stderr.on('data', (data: Buffer) => process.stderr.write(data))
    server.stdout.on('data', (data: Buffer) => {
      if (data.toString().includes('Listening on port')) {
        resolve(server)
      }
    })
    server.on('error', reject)
    server.on('exit', code => reject(new Error(`Server exited prematurely with code ${code}`)))
  })
}

describe('Client bundle in Firefox', () => {
  let server: ChildProcess
  let browser: Browser
  let page: Page
  const pageErrors: Error[] = []

  before(async () => {
    assert.ok(fs.existsSync(path.join(BUILD_DIR, 'public/client.js')), 'build/public/client.js missing - run npm run build first')

    const configFile = path.join(os.tmpdir(), `gitlab-radiator-smoke-${process.pid}.yml`)
    fs.writeFileSync(configFile, CONFIG)
    server = await startServer(configFile)

    browser = await firefox.launch()
    page = await browser.newPage()
    page.on('pageerror', error => pageErrors.push(error))
  })

  after(async () => {
    await browser?.close()
    server?.kill()
  })

  it('Should load and mount the React app', async () => {
    await page.goto(`http://localhost:${PORT}/`)
    await page.waitForSelector('h2.loading, ol.projects', {timeout: 10000})
  })

  it('Should render projects from GitLab via socket.io', async () => {
    await page.waitForSelector('ol.projects', {timeout: 30000})
    const text = await page.textContent('ol.projects')
    assert.ok(text?.includes('integration-test-project-1'), `Expected project name in: ${text}`)
  })

  it('Should not have thrown any errors in the browser', () => {
    assert.deepStrictEqual(pageErrors, [])
  })
})
