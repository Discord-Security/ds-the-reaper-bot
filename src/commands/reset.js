const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('reset')
    .setNameLocalizations({
      'pt-BR': 'resetar',
      'en-US': 'reset',
    })
    .setDescription(
      'Seu servidor no meu banco de dados ficará sem nenhuma configuração.',
    )
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    interaction.deferReply({ ephemeral: true });
    await client.db.Guilds.deleteOne({ _id: interaction.guild.id });
    await new client.db.Guilds({
      _id: interaction.guild.id,
      approved: true,
    }).save();
    interaction.editReply({ content: 'Feito com sucesso!' });
  },
};
