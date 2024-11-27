# LoL EMEA Roster Rumors Feed

Automatically generates an RSS feed of League of Legends EMEA roster rumors from the [LoL Fandom Wiki](https://lol.fandom.com/).

## Features

- Fetches latest roster rumors from the LoL Fandom Wiki
- Parses team changes, positions, and sources
- Generates both JSON and RSS feed outputs
- Updates every 4 hours via GitHub Actions

## Files

- `rumors.json`: Raw JSON data of the latest rumors
- `rumors.xml`: RSS feed of the rumors
- `index.ts`: Main script that fetches and generates the feeds

## Development

1. Install dependencies:
```bash
bun install
```

2. Run the script:
```bash
bun run start
```

## GitHub Actions

The repository includes a GitHub Actions workflow that:
- Runs every 4 hours
- Generates updated feeds
- Commits and pushes changes if there are updates

You can also manually trigger the workflow using the "Actions" tab in GitHub.

## RSS Feed

Subscribe to `rumors.xml` in your favorite RSS reader to get frequent updates about EMEA roster rumors.
