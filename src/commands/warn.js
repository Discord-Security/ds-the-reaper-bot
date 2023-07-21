const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('warn')
    .setNameLocalizations({
      'pt-BR': 'advertência',
      'en-US': 'warn',
    })
    .setDescription('Informe um usuário sobre o descumprimento de regras!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({ 'pt-BR': 'usuário', 'en-US': 'user' })
        .setDescription('Identifique o utilizador')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({ 'pt-BR': 'motivo', 'en-US': 'reason' })
        .setDescription('Identifique um motivo para o aviso')
        .setAutocomplete(true)
        .setRequired(true),
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
    const membro = interaction.options.getMember('usuário');
    const motivo = `${interaction.guild.name} - ${interaction.options.getString(
      'motivo',
    )}`;
    if (membro.id === interaction.member.id) {
      return interaction.reply({ content: 'Sem brincar...' });
    }
    if (!membro) {
      return interaction.reply({
        content: 'Sup! Não foi encontrado um usuário dentro deste servidor.',
      });
    }

    const doc = await client.db.Users.findOne({ _id: membro.id });
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Aviso - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Réu',
          value: membro.id,
          inline: true,
        },
        {
          name: '<:Discord_Chat:1035624171960541244> Motivo',
          value: motivo,
          inline: true,
        },
      )
      .setThumbnail(interaction.guild.iconURL());
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
    });
    membro
      .send({
        content:
          'Você foi avisado por ' +
          motivo +
          '. Comporte-se para não receber mais punições desse tipo.',
      })
      .catch(err => {
        if (err)
          interaction.channel.send({
            content: `<@${membro.id}>, Você foi avisado por ${motivo}. Comporte-se para não receber mais punições desse tipo.`,
            ephemeral: true,
          });
      });

    interaction.reply({
      content: `Foi concedida uma mensagem no privado do usuário e guardado dentro do histórico - Esta é a ${
        doc ? doc.warns.length + 1 : 1
      }ª advertência do usuário.`,
      ephemeral: true,
    });

    if (!doc)
      return new client.db.Users({ _id: membro.id, warns: [motivo] }).save();
    doc.warns.push(motivo);
    return doc.save();
  },
};
