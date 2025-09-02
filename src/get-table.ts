import puppeteer from 'puppeteer'

import { run } from './run'

const TABLE_SELECTOR = 'div.v-grid-tablewrapper table'

export const getTable = async () => {
  const browser = await run(
    'Launch browser',
    puppeteer.launch({
      defaultViewport: { width: 1200, height: 1000 },
    })
  )
  try {
    const page = await run(
      'Load page',
      (async () => {
        const p = await browser.newPage()
        await p.goto('https://www.iso.org/obp/ui/#search', {
          waitUntil: 'networkidle2',
        })
        await p.waitForFunction(
          () =>
            Array.from(document.querySelectorAll('label')).some((label) =>
              label.textContent?.includes('Country codes')
            ),
          { timeout: 60000 }
        )
        return p
      })()
    )

    await run(
      'Navigate to the country codes page',
      (async () => {
        // Select "Country codes"
        const found = await page.$$eval('label', (labels) => {
          const label = labels.find((l) =>
            l.textContent?.includes('Country codes')
          )
          if (label instanceof HTMLElement) {
            label.click()
            return true
          }
          return false
        })
        if (!found) {
          throw new Error('Country codes label not found')
        }

        // Hit the search button
        await page.click('div.go')

        await page.waitForSelector(TABLE_SELECTOR)
      })()
    )

    // Assuming the number of countries is never going to exceed 300,
    // changing the number of rows to 300 to extract data at once.
    await run(
      'Change "the results per page" to 300',
      (async () => {
        await page.select('select.v-select-select', '8')
        // Wait for 5 secs to let the page load
        await new Promise((resolve) => setTimeout(resolve, 5000))
        await page.waitForSelector(TABLE_SELECTOR)
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
    return { headers, rows }
  } finally {
    await browser.close()
  }
}
