import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '../..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

console.info('Step 1/2: Testing database connection…\n')
const test = spawnSync(npm, ['run', 'db:test'], { cwd: root, stdio: 'inherit', shell: true })
if (test.status !== 0) {
  console.error('\nMigration skipped — fix connection first (see tips above).')
  process.exit(test.status ?? 1)
}

console.info('\nStep 2/2: Applying schema…\n')
const migrate = spawnSync(process.execPath, [path.join(__dirname, 'migrate.js')], {
  cwd: root,
  stdio: 'inherit',
})
process.exit(migrate.status ?? 1)
