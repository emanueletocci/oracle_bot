import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

// Parses a custom emoji "<:name:id>" or "<a:name:id>" into its parts.
function parseEmoji(value) {
	const match = value.match(/^<a?:(\w+):(\d+)>$/);
	if (!match) return null;
	return { name: match[1], id: match[2], animated: value.startsWith("<a:") };
}

export default {
	data: new SlashCommandBuilder()
		.setName("emoji")
		.setDescription("Ingrandisce un emoji personalizzato")
		.addStringOption((option) =>
			option.setName("emoji").setDescription("L'emoji da ingrandire").setRequired(true),
		),

	async execute(interaction, { theme }) {
		const custom = parseEmoji(interaction.options.getString("emoji"));

		if (!custom) {
			return interaction.reply({
				content: theme.t("emoji.invalid"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`;
		const embed = new EmbedBuilder()
			.setTitle(theme.t("emoji.title", { name: custom.name }))
			.setColor(theme.color)
			.setImage(url)
			.setFooter({ text: theme.t("emoji.id", { id: custom.id }) });

		await interaction.reply({ embeds: [embed] });
	},
};
