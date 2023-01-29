const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('clear')
    .setNameLocalizations({
      'pt-BR': 'limpar',
      'en-US': 'clear'
    })
    .setDescription('Limpe algumas mensagens do chat.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName('mensagens')
        .setNameLocalizations({
          'pt-BR': 'mensagens',
          'en-US': 'messages'
        })
        .setMinValue(2)
        .setMaxValue(100)
        .setDescription('Quantas mensagens?')
        .setRequired(true)
    ),
  async execute (interaction, client) {
    const clean = interaction.options.getInteger('mensagens');
    interaction.channel.bulkDelete(clean, true).then(() => {
      interaction.reply({
        content: `Limpei ${clean.toString()} mensagens.`,
        ephemeral: true
      });
    });
  }
};
