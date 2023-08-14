const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('ban')
    .setNameLocalizations({
      'pt-BR': 'banir',
      'en-US': 'ban',
    })
    .setDescription('Realize um banimento em network')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.BanMembers)
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
    .addIntegerOption(option =>
      option
        .setName('gravidade')
        .setNameLocalizations({
          'pt-BR': 'gravidade',
          'en-US': 'severity',
        })
        .setDescription('De 1 a 2 qualifique a gravidade.')
        .setMinValue(1)
        .setMaxValue(2)
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({ 'pt-BR': 'motivo', 'en-US': 'reason' })
        .setAutocomplete(true)
        .setDescription('Identifique um motivo.'),
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
    const gravidade = interaction.options.getInteger('gravidade');
    const usuario = interaction.options.getUser('usuário');
    const motivo =
      interaction.options.getString('motivo') ?? 'Sem motivo informado.';
    if (usuario.bot || usuario.id === interaction.member.user.id)
      return interaction.reply({
        content: 'Não se pode banir bots oficiais ou a si mesmo.',
      });
    const reason = `Banido com The Reaper, por ${interaction.member.user.tag} foi definido como gravidade ${gravidade} - ${motivo}`;
    if (gravidade === 1) {
      if (interaction.guild.id === '856873114926972929')
        usuario
          .send({
            content:
              'Você foi **banido** do servidor For You. Mas não se preocupe! Você ainda tem a chance de apelar o banimento. Acesse o **Tribunal da Discord Security**, utilizando o último link do meu sobre mim. Certifique-se de selecionar a opção "For You" no botão para fazer sua apelação. Boa sorte! 🚀',
          })
          .catch(() => {
            return 0;
          });
      interaction.guild.bans
        .create(usuario.id, {
          reason,
          deleteMessageSeconds: 1 * 24 * 60 * 60,
        })
        .catch(err => {
          interaction.channel.send(`Erro: ${err}`);
        });
      interaction.reply({
        content: 'Banido com sucesso apenas neste servidor.',
        ephemeral: true,
      });
    }
    if (gravidade >= 2) {
      usuario
        .send({
          content:
            'Você foi **banido** de **todos os servidores da rede The Reaper**. Mas não se preocupe! Você sempre tem o direito de apelar o banimento. Basta acessar o **Tribunal da Discord Security**, utilizando o último link do meu sobre mim. Certifique-se de selecionar a opção "The Reaper" no botão para fazer sua apelação. Boa sorte! 🚀',
        })
        .catch(() => {
          return 0;
        });
      client.guilds.cache.forEach(a => {
        if (a.id === '1132478504898920470') return;

        a.bans
          .create(usuario.id, {
            reason,
            deleteMessageSeconds: 1 * 24 * 60 * 60,
          })
          .catch(async err => {
            if (err.code === 10013) {
              interaction.channel.send(
                'Este é um usuário desconhecido para a API do Discord, veja se não falhou algo.',
              );
            }

            if (err.code === 50013) {
              const Guilds = await client.db.Guilds.findOne({
                _id: a.id,
              });
              const mention =
                Guilds.roleId !== undefined ? '&' + Guilds.roleId : a.ownerID;
              client.channels.cache.get(client.canais.strikes).send({
                content: `<@${mention}>, seu servidor ${a.name} me rejeitou o uso de permissões administrativas, por favor re-coloque a permissão administrativa imediatamente, se você ama ter um servidor seguro.`,
              });
            }
            interaction.channel.send(
              `${a.name} está atualmente enviando o erro: ${err}`,
            );
          });
      });
      interaction.reply({
        content: `Banido com sucesso em ${client.guilds.cache.size} servidores.`,
        ephemeral: true,
      });
    }
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Banimento - ' + interaction.guild.name)
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
        {
          name: '<:Discord_Chat:1035624171960541244> Motivo',
          value: `\`${motivo}\``,
        },
      )
      .setImage('https://i.imgur.com/MyYtFil.png')
      .setThumbnail(interaction.guild.iconURL());
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
    });
  },
};
