const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('unmute')
    .setNameLocalizations({
      'pt-BR': 'desmutar',
      'en-US': 'unmute',
    })
    .setDescription('Retire o castigo de um usuário')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({
          'pt-BR': 'usuário',
          'en-US': 'user',
        })
        .setDescription('Identifique o usuário')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const member = interaction.options.getMember('usuário');
    const reason = 'Removido por: ' + interaction.member.user.tag;
    if (!member)
      return interaction.reply({
        content:
          'O membro que foi dado não é válido, você deve mencionar alguém dentro do servidor.',
      });
    await member.timeout(null, reason).catch(() => {
      return interaction.reply({
        content: 'É impossível realizar tal ação contra este usuário.',
      });
    });
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Retiro do Silenciamento - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Réu',
          value: `${member.user.tag} (${member.id})`,
          inline: true,
        },
      )
      .setThumbnail(interaction.guild.iconURL());
    client.channels.cache.get(client.canais.logs).send({ embeds: [embed] });
    return interaction.reply({
      content: `Foi retirado o castigo a ${member}.`,
      ephemeral: true,
    });
  },
};
