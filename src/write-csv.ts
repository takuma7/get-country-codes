import fs from 'fs'
import path from 'path'

import csvStringify from 'csv-stringify/lib/sync'

export const writeCsv = async (
  filePath: string,
  data: string[][]
): Promise<string> => {
  const csv = csvStringify(data)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, csv)
  return filePath
}
