const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('lock')
    .setNameLocalizations({
      'pt-BR': 'bloquear',
      'en-US': 'lock',
    })
    .setDescription('Bloqueie um canal ou todos os canais de uma categoria.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName('categoria')
        .setNameLocalizations({
          'pt-BR': 'categoria',
          'en-US': 'category',
        })
        .setDescription(
          'Você gostaria de bloquear os canais de qual categoria?',
        )
        .addChannelTypes(discord.ChannelType.GuildCategory)
        .setRequired(false),
    ),
  async execute(interaction, client) {
    const categoria = interaction.options.getChannel('categoria');
    interaction.reply({ content: 'Bloqueando...', ephemeral: true });
    if (categoria) {
      const category = interaction.guild.channels.cache.filter(
        c => c.parentId === categoria.id,
      );
      if (category)
        return category.map(channel => {
          return channel.permissionOverwrites.set(
            [
              {
                id: interaction.guild.id,
                deny: [discord.PermissionFlagsBits.SendMessages],
              },
            ],
            'Lock ativado por ' + interaction.user.tag,
          );
        });
    } else
      return interaction.channel.permissionOverwrites.set(
        [
          {
            id: interaction.guild.id,
            deny: [discord.PermissionFlagsBits.SendMessages],
          },
        ],
        'Lock ativado por ' + interaction.user.tag,
      );
  },
};
