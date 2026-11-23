// Resolves a plain-text music query to a clean "Artist - Title" via the
// public iTunes Search API, so the YouTube search matches the right song.
// URLs are returned as-is (played directly).

const ITUNES_ENDPOINT = "https://itunes.apple.com/search";
const URL_RE = /^https?:\/\//i;
const FETCH_TIMEOUT_MS = 5000;

function formatDuration(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export async function resolveSongQuery(query) {
	const trimmed = query.trim();

	// A URL is played as-is: no resolution needed.
	if (URL_RE.test(trimmed)) {
		return { query: trimmed, title: null, artist: null, duration: null };
	}

	try {
		const url = new URL(ITUNES_ENDPOINT);
		url.searchParams.set("term", trimmed);
		url.searchParams.set("media", "music");
		url.searchParams.set("entity", "song");
		url.searchParams.set("limit", "1");

		const response = await fetch(url, {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) throw new Error(`iTunes HTTP ${response.status}`);

		const data = await response.json();
		const track = data?.results?.[0];
		if (!track?.trackName) throw new Error("No iTunes result");

		return {
			query: `${track.artistName} - ${track.trackName}`,
			title: track.trackName,
			artist: track.artistName,
			duration: track.trackTimeMillis ? formatDuration(track.trackTimeMillis) : null,
		};
	} catch {
		// Fall back to the raw query: search still works, just less precise.
		return { query: trimmed, title: null, artist: null, duration: null };
	}
}
