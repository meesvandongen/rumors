# LoL Global Roster Rumors Feed

Automatically generates an RSS feed of League of Legends roster rumors from all regions using data from the [LoL Fandom Wiki](https://lol.fandom.com/).

## Features

- Fetches latest roster rumors from all regions (LCS, LEC, LCK, LPL, etc.)
- Rich information including:
  - Player details with profile links
  - Source links and attribution
  - Team changes with logos
  - Regional transfers
  - Role/position changes
- Generates both detailed JSON and HTML-formatted RSS feeds
- Updates every 4 hours via GitHub Actions

## Files

- `rumors.json`: Detailed JSON data of all rumors
- `rumors.xml`: Rich HTML-formatted RSS feed
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
- Generates updated feeds with global coverage
- Commits and pushes changes if there are updates

You can also manually trigger the workflow using the "Actions" tab in GitHub.

## RSS Feed Format

The RSS feed includes:
- Title with region, player, and team changes
- HTML-formatted description with:
  - Date and status
  - Player profile links
  - Source attribution with links
  - Detailed "From" and "To" sections
  - Region and position information
- Categories for filtering by region

Subscribe to `rumors.xml` in your favorite RSS reader to get frequent updates about LoL roster rumors from all regions.
