import fs from 'fs'
import path from 'path'

import puppeteer from 'puppeteer'
import ora from 'ora'
import csvStringify from 'csv-stringify/lib/sync'

const run = async <T = unknown>(
  text: string,
  promise: Promise<T>,
  options?: {
    succeedText?: string | ((args: { result: T; text: string }) => string)
    failText?: string | ((args: { error: Error; text: string }) => string)
  }
): Promise<T> => {
  const { succeedText, failText } = options || {}
  const spinner = ora(text).start()
  try {
    const result = await promise
    spinner.succeed(
      // eslint-disable-next-line no-nested-ternary
      typeof succeedText === 'undefined'
        ? text
        : typeof succeedText === 'function'
        ? succeedText({ result, text })
        : succeedText
    )
    return result
  } catch (error) {
    spinner.fail(
      // eslint-disable-next-line no-nested-ternary
      typeof failText === 'undefined'
        ? text
        : typeof failText === 'function'
        ? failText({ error, text })
        : failText
    )
    throw error
  }
}

const TABLE_SELECTOR = 'div.v-grid-tablewrapper table'

;(async () => {
  const browser = await run('Launch browser', puppeteer.launch())
  try {
    const page = await run(
      'Load page',
      (async () => {
        const p = await browser.newPage()
        await p.goto('https://www.iso.org/obp/ui/#search', {
          waitUntil: 'networkidle2',
        })
        await p.waitForSelector('#gwt-uid-12', { visible: true })
        return p
      })()
    )

    await run(
      'Navigate to the country codes page',
      (async () => {
        // Select "Country codes"
        await page.click('#gwt-uid-12')

        // Hit the search button
        await page.click('div.go')

        await page.waitForSelector(TABLE_SELECTOR, {
          visible: true,
        })
      })()
    )

    // Assuming the number of countries is never going to exceed 300,
    // changing the number of rows to 300 to extract data at once.
    await run(
      'Change "the results per page" to 300',
      (async () => {
        await page.select('select.v-select-select', '8')
        // Wait for 5 secs to let the page load
        await page.waitForTimeout(5000)
        await page.waitForSelector(TABLE_SELECTOR, {
          visible: true,
        })
      })()
    )

    const { headers, rows } = await run(
      'Extract country codes',
      (async () => {
        const table = await page.$(TABLE_SELECTOR)
        if (!table) {
          throw new Error(`Table couldn't be found at ${TABLE_SELECTOR}`)
        }
        return {
          headers: await table.$$eval('thead th', (ths) =>
            ths.map((th) => th.textContent ?? '')
          ),
          rows: await table.$$eval('tbody tr', (trs) =>
            trs.map((tr) =>
              Array.from(tr.querySelectorAll('td')).map(
                (td) => td.textContent ?? ''
              )
            )
          ),
        }
      })(),
      {
        succeedText: ({ result, text }) => {
          const { rows } = result
          return `${text}... Found ${rows.length} country codes`
        },
      }
    )
    await run(
      'Writing to csv file',
      (async () => {
        const table = [headers, ...rows]
        const csv = csvStringify(table)
        const fileName = `iso-3166-${Date.now()}.csv`
        fs.mkdirSync(path.resolve(__dirname, 'out'), { recursive: true })
        fs.writeFileSync(path.resolve(__dirname, 'out', fileName), csv)
        return fileName
      })(),
      {
        succeedText: ({ result, text }) => {
          return `${text}... Wrote to ./out/${result}`
        },
      }
    )
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await browser.close()
  }
})()
