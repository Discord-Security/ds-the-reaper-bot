const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('unban')
    .setNameLocalizations({
      'pt-BR': 'desbanir',
      'en-US': 'unban',
    })
    .setDescription('Realize um desbanimento em network')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({
          'pt-BR': 'usuário',
          'en-US': 'user',
        })
        .setDescription('Identifique o ID do utilizador')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('gravidade')
        .setNameLocalizations({
          'pt-BR': 'gravidade',
          'en-US': 'severity',
        })
        .setMinValue(1)
        .setMaxValue(2)
        .setDescription('Identifique a gravidade do desbanimento de 1 a 2.')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const gravidade = interaction.options.getInteger('gravidade');
    const usuario = interaction.options.getUser('usuário');
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Desbanimento - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Réu',
          value: usuario.tag ? `${usuario.tag} (${usuario.id})` : usuario.id,
          inline: true,
        },
        {
          name: '<:Discord_Online:1035624222338334770> Gravidade',
          value: gravidade.toString(),
          inline: true,
        },
      )
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://i.imgur.com/n6kzJ4x.png');
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
    });
    if (gravidade === 1) {
      await interaction.guild.members.unban(usuario).then(
        interaction.reply({
          content: 'Desbanido com sucesso apenas neste servidor.',
          ephemeral: true,
        }),
      );
    }
    if (gravidade >= 2) {
      interaction.reply({
        content: `Desbanido com sucesso em ${client.guilds.cache.size} servidores.`,
        ephemeral: true,
      });
      client.guilds.cache.forEach(guild =>
        guild.members.unban(usuario).catch(err => {
          if (err) return 0;
        }),
      );
    }
  },
};
