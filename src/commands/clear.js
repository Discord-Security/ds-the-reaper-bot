const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('clear')
    .setNameLocalizations({
      'pt-BR': 'limpar',
      'en-US': 'clear',
    })
    .setDescription('Limpe algumas mensagens do chat.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName('mensagens')
        .setNameLocalizations({
          'pt-BR': 'mensagens',
          'en-US': 'messages',
        })
        .setMinValue(2)
        .setMaxValue(100)
        .setDescription('Quantas mensagens?')
        .setRequired(true),
    )
    .addUserOption(option =>
      option
        .setName('membro')
        .setNameLocalizations({
          'pt-BR': 'membro',
          'en-US': 'member',
        })
        .setDescription('Você gostaria de limpar as mensagens de quem?')
        .setRequired(false),
    ),
  async execute(interaction, client) {
    const clean = interaction.options.getInteger('mensagens');
    const member = interaction.options.getUser('membro');
    if (member) {
      interaction.channel
        .messages.fetch({
          limit: 100,
        })
        .then(messages => {
          messages = messages
            .filter(m => m.author.id === member.id)
            .array()
            .slice(0, clean);
          interaction.channel.bulkDelete(messages, true).then(() => {
            interaction.reply({
              content: `Limpei ${clean.toString()} mensagens do usuário selecionado.`,
              ephemeral: true,
            });
          });
        });
    } else {
      interaction.channel.bulkDelete(clean, true).then(() => {
        interaction.reply({
          content: `Limpei ${clean.toString()} mensagens.`,
          ephemeral: true,
        });
      });
    }
  },
};
