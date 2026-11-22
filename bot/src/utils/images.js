// Small image helpers shared by the commands.

// Whether a value is a remote image URL (rather than a local file path or an
// attachment:// reference). Remote images are embedded by URL and fetched by
// Discord itself, so the bot never uploads them.
export function isRemoteUrl(value) {
	return typeof value === "string" && /^https?:\/\//.test(value);
}
