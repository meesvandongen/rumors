import { parse } from "node-html-parser";
import RSS from "rss";
import { writeFileSync } from "node:fs";

const RUMORS_URL =
	"https://lol.fandom.com/Special:RunQuery/RosterRumorQuery?RRQ%5Blimit%5D=100&RRQ%5Bwhere%5D=1=1&_run=";

interface Rumor {
	date: string;
	status: string;
	source: {
		name: string;
		url: string;
	};
	player: {
		name: string;
		url: string;
	};
	from: {
		region: string;
		team: {
			name: string;
			image: string;
		};
		position: string;
	};
	to: {
		region: string;
		team: {
			name: string;
			image: string;
		};
		position: string;
	};
}

function getPosition(cell: any): string {
	const roleSprite = cell.querySelector(".role-sprite");
	if (roleSprite) {
		const title = roleSprite.getAttribute("title");
		return title || "Unknown Position";
	}
	return "Unknown Position";
}

function extractTeamInfo(cell: any) {
	const img = cell.querySelector("img");
	return {
		name:
			img?.getAttribute("alt")?.replace("logo std", "").trim() ||
			"Unknown Team",
		image: img?.getAttribute("data-src") || img?.getAttribute("src") || "",
	};
}

function extractSourceInfo(cell: any) {
	const link = cell.querySelector("a");
	return {
		name: link?.text.trim() || cell.text.trim(),
		url: link?.getAttribute("href") || "",
	};
}

function extractPlayerInfo(cell: any) {
	const link = cell.querySelector("a");
	return {
		name: link?.text.trim() || cell.text.trim(),
		url: link?.getAttribute("href")
			? `https://lol.fandom.com${link.getAttribute("href")}`
			: "",
	};
}

function parseDate(dateStr: string): Date {
	// Convert YYYY-MM-DD to Date object
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day); // month is 0-based in JS Date
}

async function fetchRumors() {
	try {
		const response = await fetch(RUMORS_URL);
		const html = await response.text();

		// Parse the HTML
		const root = parse(html);
		const table = root.querySelector(".wikitable.hoverable-rows");

		if (!table) {
			throw new Error("Could not find rumors table in response");
		}

		// Parse table rows
		const rows = table.querySelectorAll("tr");
		const rumors: Rumor[] = [];

		// Skip first two header rows
		for (let i = 2; i < rows.length; i++) {
			const row = rows[i];
			const cells = row.querySelectorAll("td");

			if (cells.length >= 9) {
				const rumor: Rumor = {
					date: cells[0].text.trim(),
					status: cells[1].text.trim(),
					source: extractSourceInfo(cells[2]),
					player: extractPlayerInfo(cells[3]),
					from: {
						region: cells[4].text.trim(),
						team: extractTeamInfo(cells[5]),
						position: getPosition(cells[6]),
					},
					to: {
						region: cells[7].text.trim(),
						team: extractTeamInfo(cells[8]),
						position: getPosition(cells[9]),
					},
				};
				rumors.push(rumor);
			}
		}

		// Write raw JSON for inspection
		writeFileSync("rumors.json", JSON.stringify(rumors, null, 2));
		console.log("Raw JSON data written to rumors.json");

		// Create RSS feed
		const feed = new RSS({
			title: "LoL Global Roster Rumors",
			description: "Latest League of Legends roster rumors from all regions",
			feed_url: RUMORS_URL,
			site_url: "https://lol.fandom.com",
			language: "en",
			pubDate: new Date(),
			categories: ["League of Legends", "Esports", "Roster Changes"],
		});

		// Add each rumor as an RSS item
		for (const rumor of rumors) {
			const regionChange =
				rumor.from.region === rumor.to.region
					? rumor.from.region
					: `${rumor.from.region} → ${rumor.to.region}`;

			const title = `[${regionChange}] ${rumor.player.name}: ${rumor.from.team.name} → ${rumor.to.team.name}`;

			const description = `
        <h3>${title}</h3>
        <p><strong>Status:</strong> ${rumor.status}</p>
        <p><strong>Player:</strong> <a href="${rumor.player.url}">${rumor.player.name}</a></p>
        <p><strong>Source:</strong> <a href="${rumor.source.url}">${rumor.source.name}</a></p>
        
        <h4>From:</h4>
        <ul>
          <li>Region: ${rumor.from.region}</li>
          <li>Team: ${rumor.from.team.name}</li>
          <li>Position: ${rumor.from.position}</li>
        </ul>
        
        <h4>To:</h4>
        <ul>
          <li>Region: ${rumor.to.region}</li>
          <li>Team: ${rumor.to.team.name}</li>
          <li>Position: ${rumor.to.position}</li>
        </ul>
      `;

			feed.item({
				title,
				description,
				url: rumor.source.url,
				guid: `${rumor.date}-${rumor.player.name}-${rumor.from.team.name}-${rumor.to.team.name}`,
				date: parseDate(rumor.date),
				categories: [rumor.from.region, rumor.to.region, "Roster Changes"],
			});
		}

		// Write RSS feed to file
		writeFileSync("rumors.xml", feed.xml({ indent: true }));
		console.log("RSS feed generated successfully at rumors.xml");
	} catch (error) {
		console.error("Error fetching or parsing rumors:", error);
	}
}

// Run the script
fetchRumors();
