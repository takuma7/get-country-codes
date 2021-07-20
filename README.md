# ISO-3166 fetcher

Fetches the canonical ISO 3166 country codes from [ISO's website](https://www.iso.org/obp/ui/#search) and writes to a CSV file.

This repository runs the command via GitHub Actions on push and schedule (monthly). The resulting CSV file is then pushed to [`takuma7/iso-3166-csv`](https://github.com/takuma7/iso-3166-csv) for easy use.

## CLI

Installation:
```sh
pnpm add --global iso-3166-fetcher
```

Usage:
```sh
get-country-codes -o ./out/iso-3166.csv
```

## API

### getTable

Gets the country codes table from the ISO website.

`getTable(): Promise<{ headers: string[]; rows: string[][] }>`

Usage:

```ts
const { headers, rows } = await getTable()
```
