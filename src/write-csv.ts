import fs from 'fs'
import path from 'path'

import csvStringify from 'csv-stringify/lib/sync'

export const writeCsv = async (
  dirPath: string,
  data: string[][]
): Promise<string> => {
  const csv = csvStringify(data)
  const fileName = `iso-3166-${Date.now()}.csv`
  fs.mkdirSync(dirPath, { recursive: true })
  const resultPath = path.resolve(dirPath, fileName)
  fs.writeFileSync(resultPath, csv)
  return resultPath
}
