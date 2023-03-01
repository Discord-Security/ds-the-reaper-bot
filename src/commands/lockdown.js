const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('lockdown')
    .setNameLocalizations({
      'pt-BR': 'bloquear_servidor',
      'en-US': 'lockdown',
    })
    .setDescription('Bloqueie um servidor inteiro!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ativar')
        .setNameLocalizations({ 'pt-BR': 'ativar', 'en-US': 'activate' })
        .setDescription('Ative o sistema.')
        .addStringOption(option =>
          option
            .setName('motivo')
            .setNameLocalizations({ 'pt-BR': 'motivo', 'en-US': 'reason' })
            .setDescription('Informe um motivo')
            .setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('desativar')
        .setNameLocalizations({ 'pt-BR': 'desativar', 'en-US': 'desactivate' })
        .setDescription('Desative o sistema.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const channels = interaction.guild.channels.cache
      .filter(channel => channel.type === discord.ChannelType.GuildText)
      .filter(
        channel =>
          channel
            .permissionsFor(interaction.guild.id)
            .has(discord.PermissionFlagsBits.ViewChannel) === true,
      );
    const guild = await client.db.Guilds.findOne({ _id: interaction.guild.id });
    switch (subcommand) {
      case 'ativar': {
        await interaction.reply({
          content: `Sucesso, todo o servidor foi bloqueado! Utilize **/lockdown desactivate** para abrir novamente o servidor.`,
        });
        await channels
          .filter(
            channel =>
              channel
                .permissionsFor(interaction.guild.id)
                .has(discord.PermissionFlagsBits.SendMessages) === true,
          )
          .map(channel => {
            let motivo = interaction.options.getString('motivo') || null;
            motivo !== null
              ? client.channels.cache.get(channel.id).send({
                  embeds: [
                    new discord.EmbedBuilder()
                      .setColor(client.cor)
                      .setTitle('Lockdown no servidor globalmente!')
                      .setDescription(motivo)
                      .setThumbnail('https://i.imgur.com/UhN88X9.png'),
                  ],
                })
              : (motivo = null);
            guild.channelsLockdown.push(channel.id);
            return channel.permissionOverwrites.set(
              [
                {
                  id: interaction.guild.id,
                  deny: [discord.PermissionFlagsBits.SendMessages],
                },
              ],
              'Modo Lockdown ativado',
            );
          });
        guild.save();
        break;
      }
      case 'desativar': {
        await interaction.reply({
          content: `Sucesso, todo o servidor foi desbloqueado!`,
        });
        await channels.map(channel => {
          if (!guild.channelsLockdown.includes(channel.id)) return 0;
          guild.channelsLockdown.pull(channel.id);
          return channel.permissionOverwrites.set(
            [
              {
                id: interaction.guild.id,
                allow: [discord.PermissionFlagsBits.SendMessages],
              },
            ],
            'Modo Lockdown ativado',
          );
        });
        guild.save();
        break;
      }
    }
  },
};
