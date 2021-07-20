import path from 'path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getTable } from './get-table'
import { writeCsv } from './write-csv'
import { run } from './run'

const argv = yargs(hideBin(process.argv))
  .options({
    'output-dir': {
      alias: 'o',
      default: '.',
      type: 'string',
    },
  })
  .parseSync()

;(async () => {
  const { headers, rows } = await getTable()
  const table = [headers, ...rows]

  let outputDir = argv['output-dir']
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.resolve(process.cwd(), outputDir)
  }

  await run('Writing csv', writeCsv(outputDir, table), {
    succeedText: ({ result, text }) => {
      return `${text}... Wrote to ${result}`
    },
  })
})()
