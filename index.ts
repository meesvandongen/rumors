import { parse } from 'node-html-parser';
import RSS from 'rss';
import { writeFileSync } from 'fs';

const RUMORS_URL = 'https://lol.fandom.com/Special:RunQuery/RosterRumorQuery?RRQ%5Bregion%5D=EMEA&RRQ%5Blimit%5D=100&_run=';

interface Rumor {
  date: string;
  status: string;
  source: string;
  player: string;
  fromRegion: string;
  fromTeam: string;
  fromPos: string;
  toRegion: string;
  toTeam: string;
  toPos: string;
}

function getPosition(cell: any): string {
  const roleSprite = cell.querySelector('.role-sprite');
  if (roleSprite) {
    const title = roleSprite.getAttribute('title');
    return title || 'Unknown Position';
  }
  return 'Unknown Position';
}

async function fetchRumors() {
  try {
    const response = await fetch(RUMORS_URL);
    const html = await response.text();
    
    // Parse the HTML
    const root = parse(html);
    const table = root.querySelector('.wikitable.hoverable-rows');
    
    if (!table) {
      throw new Error('Could not find rumors table in response');
    }

    // Parse table rows
    const rows = table.querySelectorAll('tr');
    const rumors: Rumor[] = [];

    // Skip first two header rows
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');
      
      if (cells.length >= 9) {
        const rumor: Rumor = {
          date: cells[0].text.trim(),
          status: cells[1].text.trim(),
          source: cells[2].text.trim(),
          player: cells[3].text.trim(),
          fromRegion: cells[4].text.trim(),
          fromTeam: cells[5].querySelector('img')?.getAttribute('alt')?.replace('logo std', '').trim() || 'Unknown Team',
          fromPos: getPosition(cells[6]),
          toRegion: cells[7].text.trim(),
          toTeam: cells[8].querySelector('img')?.getAttribute('alt')?.replace('logo std', '').trim() || 'Unknown Team',
          toPos: getPosition(cells[9])
        };
        rumors.push(rumor);
      }
    }

    // Write raw JSON for inspection
    writeFileSync('rumors.json', JSON.stringify(rumors, null, 2));
    console.log('Raw JSON data written to rumors.json');

    // Log first rumor for inspection
    console.log('First rumor object:', rumors[0]);

    // Create RSS feed
    const feed = new RSS({
      title: 'LoL EMEA Roster Rumors',
      description: 'Latest League of Legends roster rumors for the EMEA region',
      feed_url: RUMORS_URL,
      site_url: 'https://lol.fandom.com',
      language: 'en',
      pubDate: new Date()
    });

    // Add each rumor as an RSS item
    for (const rumor of rumors) {
      const title = `${rumor.player}: ${rumor.fromTeam} → ${rumor.toTeam}`;
      const description = `
        Date: ${rumor.date}
        Status: ${rumor.status}
        Source: ${rumor.source}
        Player: ${rumor.player}
        From: ${rumor.fromTeam} (${rumor.fromPos})
        To: ${rumor.toTeam} (${rumor.toPos})
      `;

      feed.item({
        title,
        description,
        url: RUMORS_URL,
        guid: `${rumor.date}-${rumor.player}`,
        date: new Date(rumor.date)
      });
    }

    // Write RSS feed to file
    writeFileSync('rumors.xml', feed.xml({ indent: true }));
    console.log('RSS feed generated successfully at rumors.xml');

  } catch (error) {
    console.error('Error fetching or parsing rumors:', error);
  }
}

// Run the script
fetchRumors();