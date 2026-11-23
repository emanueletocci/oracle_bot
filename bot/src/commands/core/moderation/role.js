import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("role")
		.setDescription("Assegna o rimuove un ruolo a un utente")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Assegna un ruolo")
				.addUserOption((option) =>
					option.setName("target").setDescription("Utente").setRequired(true),
				)
				.addRoleOption((option) =>
					option.setName("role").setDescription("Ruolo").setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Rimuove un ruolo")
				.addUserOption((option) =>
					option.setName("target").setDescription("Utente").setRequired(true),
				)
				.addRoleOption((option) =>
					option.setName("role").setDescription("Ruolo").setRequired(true),
				),
		),

	async execute(interaction, { theme }) {
		const sub = interaction.options.getSubcommand();
		const target = interaction.options.getUser("target");
		const role = interaction.options.getRole("role");

		const member = await interaction.guild.members.fetch(target.id).catch(() => null);
		if (!member) {
			return interaction.reply({
				content: theme.t("role.memberNotFound"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const botHighest = interaction.guild.members.me.roles.highest;
		if (role.position >= botHighest.position) {
			return interaction.reply({
				content: theme.t("role.tooHigh"),
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			if (sub === "add") {
				await member.roles.add(role);
				return interaction.reply(
					theme.t("role.added", { role: role.name, user: target.username }),
				);
			}

			await member.roles.remove(role);
			return interaction.reply(
				theme.t("role.removed", { role: role.name, user: target.username }),
			);
		} catch {
			return interaction.reply({
				content: theme.t("errors.generic"),
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
