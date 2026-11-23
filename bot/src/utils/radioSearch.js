// Search radio stations via radio-browser.info (public, no key).

const BASE_URLS = [
	"https://all.api.radio-browser.info",
	"https://de1.api.radio-browser.info",
];

const FETCH_TIMEOUT_MS = 8000;

export async function searchRadioStations(query, limit = 8) {
	const term = encodeURIComponent(query.trim());
	// order by clickcount so the most popular station for a name comes first
	const path = `/json/stations/byname/${term}?limit=${limit}&order=clickcount&reverse=true`;

	for (const base of BASE_URLS) {
		try {
			const response = await fetch(`${base}${path}`, {
				signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
				headers: { "User-Agent": "OracleBot/1.0" },
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const stations = await response.json();
			// Keep only stations we can actually play.
			return stations.map((station) => ({
				name: station.name ?? "Radio",
				country: station.countrycode ?? "",
				codec: station.codec ?? undefined,
				bitrate: station.bitrate ?? undefined,
				url: station.url_resolved ?? station.url,
			}));
		} catch {
			// try the next mirror
		}
	}

	return [];
}

// Determines the best URL to feed to ffmpeg: prefer a direct audio URL.
export function toAudioUrl(station) {
	return station.url;
}

// Whether the given result "clearly" matches the requested name — used to
// decide if /radio play can start it directly instead of showing a list.
// The comparison is case/diacritic-insensitive and checks the lowercase name
// is included in (or contains) the query words.
function normalize(text) {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

export function isConfidentMatch(query, stationName) {
	const q = normalize(query);
	const n = normalize(stationName);
	if (!q) return false;
	return n.includes(q) || q.includes(n);
}