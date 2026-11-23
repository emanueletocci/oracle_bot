// Formats a duration in milliseconds as "1g 2h 3m 4s".
export function formatUptime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts = [];
	if (days) parts.push(`${days}g`);
	if (hours) parts.push(`${hours}h`);
	if (minutes) parts.push(`${minutes}m`);
	parts.push(`${seconds}s`);

	return parts.join(" ");
}
