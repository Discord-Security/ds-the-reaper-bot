const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('autopublish')
    .setNameLocalizations({
      'pt-BR': 'autopublicar',
      'en-US': 'autopublish',
    })
    .setDescription('Ative ou desative o sistema de autopublicar!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adiciona um canal ao sistema de autopublicar.')
        .setNameLocalizations({ 'pt-BR': 'adicionar', 'en-US': 'add' })
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildAnnouncement)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove um canal ao sistema de autopublicar.')
        .setNameLocalizations({ 'pt-BR': 'remover', 'en-US': 'remove' })
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildAnnouncement)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setNameLocalizations({ 'pt-BR': 'lista', 'en-US': 'list' })
        .setDescription('Lista todos os canais do sistema de autopublicar.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const channel = interaction.options.getChannel('canal') || null;
    const doc = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    });
    switch (subcommand) {
      case 'add': {
        doc.channelsAutopublish.push(channel.id);
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'remove': {
        doc.channelsAutopublish.pull(channel.id);
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'list': {
        interaction.reply({
          content: `Aqui está a lista de canais que utilizam o sistema de autopublicar:\n\n${doc.channelsAutopublish
            .map(c => {
              return `<#${c}>`;
            })
            .join('\n')}`,
          ephemeral: true,
        });
        break;
      }
    }
  },
};
