import { spawn } from 'node:child_process'
import { openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const log = openSync('/tmp/agent-055-next-dev.log', 'a')
const dev = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: ['ignore', log, log],
})
dev.unref()

const deadline = Date.now() + 30_000
while (Date.now() < deadline) {
  try {
    const response = await fetch('http://localhost:3100')
    if (response.ok) break
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 250))
}

const response = await fetch('http://localhost:3100')
if (!response.ok) {
  throw new Error(`next dev failed to start: ${response.status}`)
}

writeFileSync(
  'app/page.tsx',
  `import { Summary } from '@/components/summary'

export default function DashboardPage() {
  return (
    <main>
      <h1>Project dashboard</h1>
      <Summary />
    </main>
  )
}
`
)

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
delete packageJson.scripts['eval:setup']
writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`)
rmSync(new URL(import.meta.url))
