import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Mostra la latenza del bot"),

	async execute(interaction, { theme }) {
		await interaction.reply(theme.t("ping.calculating"));

		const roundtrip = Date.now() - interaction.createdTimestamp;
		const gateway = Math.max(0, interaction.client.ws.ping);

		await interaction.editReply(
			`${theme.t("ping.gateway", { ms: gateway })}\n${theme.t("ping.roundtrip", { ms: roundtrip })}`,
		);
	},
};
