const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('pause_invite')
    .setNameLocalizations({
      'pt-BR': 'pausar_convite',
      'en-US': 'pause_invite',
    })
    .setDescription('Pause temporariamente os convites do servidor.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageGuild)
    .addBooleanOption(option =>
      option
        .setName('pausar')
        .setNameLocalizations({
          'pt-BR': 'pausar',
          'en-US': 'pause',
        })
        .setDescription(
          'Identifique true para pausar e false para retirar a pausa',
        )
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const disabled = interaction.options.getBoolean('pausar');
    interaction.guild.disableInvites(disabled);
    return interaction.reply({
      content: `Convites ${disabled ? 'pausados' : 'ativados'} com sucesso.`,
    });
  },
};
