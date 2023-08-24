const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('delete_channels')
    .setNameLocalizations({
      'pt-BR': 'apagar_canais',
      'en-US': 'delete_channels',
    })
    .setDescription('Retire todos os canais de uma categoria.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName('categoria')
        .setNameLocalizations({
          'pt-BR': 'categoria',
          'en-US': 'category',
        })
        .setDescription('Você gostaria de deletar os canais de qual categoria?')
        .addChannelTypes(discord.ChannelType.GuildCategory)
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const categoria = interaction.options.getChannel('categoria');
    interaction.reply({ content: 'Apagando...', ephemeral: true });
    const category = interaction.guild.channels.cache.filter(
      c => c.parentId === categoria.id,
    );
    if (category) {
      category.map(channel => {
        return interaction.guild.channels.cache.get(channel.id).delete();
      });
    }
  },
};
