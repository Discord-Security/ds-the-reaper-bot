const discord = require('discord.js');
const ms = require('ms-pt-br');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('mute')
    .setNameLocalizations({
      'pt-BR': 'silenciar',
      'en-US': 'mute',
    })
    .setDescription('Castigue um utilizador de falar no chat temporariamente.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({
          'pt-BR': 'usuário',
          'en-US': 'user',
        })
        .setDescription('Mencione ou utilize um ID')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('tempo')
        .setNameLocalizations({
          'pt-BR': 'tempo',
          'en-US': 'time',
        })
        .setDescription('Identifique um tempo. Exemplo: 1d, 1h, 1m')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({
          'pt-BR': 'motivo',
          'en-US': 'reason',
        })
        .setAutocomplete(true)
        .setDescription('Identifique o motivo do castigo'),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = require('../../reasons.json');
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue.toLowerCase()),
    );
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    );
  },
  async execute(interaction, client) {
    const member = interaction.options.getMember('usuário');
    const reason =
      interaction.options.getString('motivo') ??
      'Sem motivo definido. - Punido por: ' + interaction.member.user.tag;
    const time = ms(interaction.options.getString('tempo'));

    if (!time) {
      return interaction.reply({
        content:
          'O tempo que foi dado não é válido. Você deve usar d para dias, h para horas e m para minutos.',
      });
    }
    if (!member || member.bot || member.id === interaction.member.user.id)
      return interaction.reply({
        content: 'Não se pode banir bots oficiais ou a si mesmo.',
      });
    await member.timeout(time, reason).catch(error => {
      if (error)
        return interaction.reply({
          content: 'É impossível realizar tal ação contra este usuário.',
        });
    });
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Silenciamento - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Réu',
          value: `${member.user.tag} (${member.user.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Chat:1035624171960541244> Motivo',
          value: reason,
          inline: true,
        },
        {
          name: '<:Discord_Info:1036702634603728966> Tempo',
          value: ms(time, { long: time }),
          inline: true,
        },
      )
      .setImage('https://i.imgur.com/R997gVO.png')
      .setThumbnail(interaction.guild.iconURL());
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
    });
    return interaction.reply({
      content: `${member} foi mutado por ${ms(time, { long: true })}`,
      ephemeral: true,
    });
  },
};
