// Theme system.
// "neutral" is the complete base theme; other themes override only the keys
// they want to change. Missing keys automatically fall back to "neutral".
import neutral from "#themes/neutral.js";
import persona from "#themes/persona.js";

const THEMES = { neutral, persona };
export const THEME_NAMES = Object.keys(THEMES);

const lookup = (obj, key) =>
	key.split(".").reduce((node, part) => node?.[part], obj);

export function createTheme(name) {
	const theme = THEMES[name] ?? THEMES.neutral;

	return {
		name: THEMES[name] ? name : "neutral",
		color: theme.color ?? neutral.color,

		// t("ship.title") → value from the theme (or neutral).
		// If the value is a function it is called with `vars`.
		t(key, vars = {}) {
			const value = lookup(theme, key) ?? lookup(neutral, key);
			if (value === undefined) return key;
			return typeof value === "function" ? value(vars) : value;
		},
	};
}
