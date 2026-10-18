# get-country-codes

> Development has moved to [`takuma7/iso-3166-1-ts`](https://github.com/takuma7/iso-3166-1-ts).
> The scraper now lives in [`packages/get-country-codes`](https://github.com/takuma7/iso-3166-1-ts/tree/main/packages/get-country-codes).
> The npm package name, CLI command, and `getTable` API are unchanged. Open new issues
> and pull requests in the canonical repository. This repository is retained for
> its history; the former cross-repository CSV update workflow has been retired.


Fetches the canonical ISO 3166-1 country codes from [ISO's website](https://www.iso.org/obp/ui/#search) and writes to a CSV file.

If your only interest is to get the CSV file, you can check  [`takuma7/iso-3166-1-csv`](https://github.com/takuma7/iso-3166-1-csv) out.

## CLI

Installation:
```sh
pnpm add --global get-country-codes
```

Usage:
```sh
get-country-codes -o ./out/iso-3166-1.csv # You can specify the output path (default: ./iso-3166-1.csv)
```

## API

### getTable

Gets the country codes table from the ISO website.

`getTable(): Promise<{ headers: string[]; rows: string[][] }>`

Usage:

```ts
const { headers, rows } = await getTable()
```
