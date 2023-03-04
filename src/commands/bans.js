const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('bans')
    .setDescription('Bans Category!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informação de um banimento')
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('Identifique o id de um usuário.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setNameLocalizations({ 'pt-BR': 'pesquisar', 'en-US': 'search' })
        .setDescription('Pesquisar banimentos por motivos.')
        .addStringOption(option =>
          option
            .setName('motivo')
            .setNameLocalizations({ 'pt-BR': 'motivo', 'en-US': 'reason' })
            .setDescription('Informe o paramêtro de busca.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('export')
        .setNameLocalizations({ 'pt-BR': 'exportar', 'en-US': 'export' })
        .setDescription(
          "Exporte todos os ID's que foram banidos de seu servidor.",
        ),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const id = interaction.options.getString('id') || null;
    switch (subcommand) {
      case 'info': {
        const banInfo = await interaction.guild.bans.fetch(id).catch(() => {
          interaction.reply('Não foi encontrado um banimento ou usuário.');
        });

        const BanInfoEmbed = new discord.EmbedBuilder()
          .setTimestamp()
          .setColor(client.cor)
          .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
          .setTitle(`Informações do Banimento`)
          .addFields(
            {
              name: `<:Discord_Danger:1028818835148656651> Usuário:`,
              value: `\`${banInfo.user.tag}\``,
            },
            {
              name: `<:Discord_ID:1028818985942253578> ID do Usuário:`,
              value: `\`${banInfo.user.id}\``,
            },
            {
              name: `<:Discord_Chat:1035624171960541244> Motivo do Banimento:`,
              value: `\`${banInfo.reason || 'Sem motivo informado.'}\``,
            },
          );
        interaction.reply({ embeds: [BanInfoEmbed] });
        break;
      }
      case 'export': {
        const completeBanIdList = await (async (
          a = [],
          last = 0,
          limit = 1000,
        ) => {
          while (limit === 1000) {
            const bans = await interaction.guild.bans.fetch({
              after: last,
              // eslint-disable-next-line object-shorthand
              limit: limit,
            });
            const banlist = bans.map(user => user.user.id);

            last = bans.last().user.id;
            limit = banlist.length;

            for (let i = 0; i < limit; i++) {
              a.push(banlist[i]);
            }
          }

          return a;
        })();

        const banIdObj = ((o = {}) => {
          for (let i = 0; i < completeBanIdList.length; i++) {
            o[completeBanIdList[i]] = 1;
          }

          return o;
        })();

        const list = Object.keys(banIdObj).join('\n');
        const lista = await new discord.AttachmentBuilder(Buffer.from(list), {
          name: 'bans.txt',
        });
        await interaction.reply({
          content: `**${completeBanIdList.length} usuários foram banidos do seu servidor:**`,
          files: [lista],
        });
        break;
      }
      case 'search': {
        const motivo = interaction.options.getString('motivo');
        const completeBanIdList = await (async (
          a = [],
          last = 0,
          limit = 1000,
        ) => {
          while (limit === 1000) {
            const bans = await interaction.guild.bans.fetch({
              after: last,
              limit,
            });
            const banlist = bans.map(user => user.user.id);

            last = bans.last().user.id;
            limit = banlist.length;

            for (let i = 0; i < limit; i++) {
              a.push(banlist[i]);
            }
          }

          return a;
        })();

        const bans = [];
        for (let i = 0; i < completeBanIdList.length; i++) {
          const banInfo = await interaction.guild.bans.fetch(
            completeBanIdList[i],
          );
          bans.push(banInfo.filter(b => b.reason.includes(motivo)));
        }

        const emb = new discord.MessageEmbed()
          .setTimestamp()
          .setTitle('Banimentos filtrados por: ' + motivo)
          .setDescription(
            `Tag - ID - Motivo\n\n${bans
              .map(
                b =>
                  `${b.user.tag} - ${b.user.id} - ${b.reason.replace(
                    motivo,
                    '**' + motivo + '**',
                  )}`,
              )
              .join('\n')}`,
          )
          .setFooter(`${motivo} banimentos foram banidos.`);
        interaction.reply({
          content: `Aqui está o que achei, no total são ${bans} banidos pelo motivo filtrado:`,
          embeds: [emb],
        });
        break;
      }
    }
  },
};
