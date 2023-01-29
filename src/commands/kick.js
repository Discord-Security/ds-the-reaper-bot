const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('kick')
    .setNameLocalizations({
      'pt-BR': 'expulsar',
      'en-US': 'kick',
    })
    .setDescription(
      'Uma maneira de arrefecer as coisas sem ser obrigatório um banimento.',
    )
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({
          'pt-BR': 'usuário',
          'en-US': 'user',
        })
        .setDescription('Qual usuário?')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({
          'pt-BR': 'motivo',
          'en-US': 'reason',
        })
        .setDescription('Qual o motivo da expulsão?'),
    ),
  async execute(interaction, client) {
    const user = interaction.options.getMember('usuário');
    const reason =
      interaction.options.getString('motivo') ?? 'Sem motivo informado';
    const member =
      interaction.guild.members.cache.get(user.id) ||
      (await interaction.guild.members.fetch(user.id).catch(err => {
        if (err) return 0;
      }));
    if (
      interaction.member.roles.highest.position <= member.roles.highest.position
    ) {
      return interaction.reply({
        content: 'O membro que você mencionou tem cargos mais altos que você.',
      });
    }
    if (!member.bannable || member.user.id === client.user.id) {
      return interaction.reply({ content: 'Não posso kickar esse membro.' });
    }
    member.kick({
      reason: `${reason} - Punido por: ${interaction.member.user.tag}`,
    });
    interaction.reply({
      content: `${member.user.tag} foi kickado por ${reason} com sucesso.`,
      ephemeral: true,
    });

    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Expulsão - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Réu',
          value: `${member.user.tag} (${user.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Chat:1035624171960541244> Motivo',
          value: reason,
          inline: true,
        },
      )
      .setImage('https://i.imgur.com/aUuUubU.png');
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
    });
  },
};
