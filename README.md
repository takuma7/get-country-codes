# ISO-3166 fetcher

Fetches ISO 3166 country codes from [the ISO website](https://www.iso.org/obp/ui/#search) and writes to a CSV file.

### CLI

```sh
pnpm add --global iso-3166-fetcher
get-country-codes -o ./out # output folder
```

### API

#### getTable

Gets the country codes table from the ISO website.

`getTable(): Promise<{ headers: string[]; rows: string[][] }>`

Usage:

```ts
const { headers, rows } = await getTable()
```
