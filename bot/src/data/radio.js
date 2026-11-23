// Built-in radio stations. Streams are Icecast/Shoutcast URLs over HTTP(S)
// that DirectLink can play directly. Custom stations per-guild live in the
// database (guild_radio_stations), managed with /radio save / radio remove.

export const RADIO_STATIONS = [
	{
		name: "Lofi Girl",
		url: "https://play.stream2u.com/C6spJ7Ykx5dvvNzhP6ebWe",
	},
	{
		name: "Chill Radio",
		url: "https://chi.streamguys1.com/chillout",
	},
	{
		name: "Synthwave Radio",
		url: "https://radio.hyperbackup.net/music",
	},
	{
		name: "SomaFM Groove Salad",
		url: "https://ice1.somafm.com/groovesalad-128-mp3",
	},
	{
		name: "SomaFM Drone Zone",
		url: "https://ice1.somafm.com/dronezone-128-mp3",
	},
	{
		name: "Radio Paradise",
		url: "https://stream.radioparadise.com/mp3-128",
	},
];