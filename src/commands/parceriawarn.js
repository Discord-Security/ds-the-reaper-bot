const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('parcerias_aviso')
    .setNameLocalizations({
      'pt-BR': 'parcerias_aviso',
      'en-US': 'patners_warn',
    })
    .setDescription('Configure um aviso para cada nova parceria!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal')
        .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
        .setDescription('Defina um canal')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mensagem')
        .setNameLocalizations({ 'pt-BR': 'mensagem', 'en-US': 'message' })
        .setDescription('Defina uma mensagem'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('rank')
        .setNameLocalizations({ 'pt-BR': 'classificação', 'en-US': 'rank' })
        .setDescription('Veja a classificação dos seus staffs parceria'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setNameLocalizations({ 'pt-BR': 'informação', 'en-US': 'info' })
        .setDescription('Deixe-lhe explicar como este sistema funciona.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ativar')
        .setNameLocalizations({ 'pt-BR': 'ativar', 'en-US': 'activate' })
        .setDescription('Deixe-lhe explicar como este sistema funciona.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const doc = await client.db.Guilds.findOne({ _id: interaction.guild.id });
    switch (subcommand) {
      case 'rank': {
        await interaction.reply({ content: 'Pesquisando...' });
        let page;
        let buttonname;
        let collector;
        await Search(1);
        async function Search(pagina) {
          const waifu = await client.db.Partners.paginate(
            { serverId: interaction.guild.id },
            { page: pagina, limit: 15, sort: { partners: -1 } },
          ).catch(err => {
            if (err)
              return interaction.editReply({
                content: 'Consulta inválida',
              });
          });
          page = waifu.page;

          const str2 = Math.floor(Math.random() * 100);
          buttonname = str2;
          const antes = new discord.ButtonBuilder()
            .setCustomId(str2 + 'prev')
            .setEmoji('1069621736397607052')
            .setStyle(2)
            .setDisabled(!waifu.hasPrevPage);
          const depois = new discord.ButtonBuilder()
            .setCustomId(str2 + 'next')
            .setEmoji('1041100297629597836')
            .setStyle(2)
            .setDisabled(!waifu.hasNextPage);
          const botao = new discord.ActionRowBuilder()
            .addComponents(antes)
            .addComponents(depois);
          const waifus = new discord.EmbedBuilder()
            .setTitle('🏆 » TOP 15 STAFFS PARCERIA')
            .setFooter({
              text: `Página ${waifu.page} de ${waifu.totalPages} páginas`,
            })
            .setColor(client.cor);
          if (waifu.docs[0]) {
            const fields = waifu.docs.map((w, index) => ({
              name: `${waifu.pagingCounter + index}. ${
                interaction.guild.members.cache.get(w._id.split('-')[0])
                  ? interaction.guild.members.cache.get(w._id.split('-')[0])
                      .user.username
                  : w._id
              }`,
              value: `**Parcerias no total:** ${w.partners.toLocaleString(
                'pt-BR',
              )}`,
              inline: true,
            }));

            waifus.addFields(...fields);
          }
          const mensagem = await interaction.editReply({
            content: null,
            embeds: [waifus],
            components: [botao],
          });
          const filter = interaction =>
            interaction.customId === buttonname + 'next' ||
            interaction.customId === buttonname + 'prev';
          collector = mensagem.createMessageComponentCollector({
            filter,
            time: 300000,
          });
        }
        collector.on('collect', i => {
          if (i.user.id !== interaction.member.id)
            return i.editReply({
              content: 'Consulta inválida.',
              ephemeral: true,
            });

          if (i.customId === buttonname + 'next') {
            i.deferUpdate();
            Search(page + 1);
          }
          if (i.customId === buttonname + 'prev') {
            i.deferUpdate();
            Search(page - 1);
          }
        });
        break;
      }
      case 'mensagem': {
        interaction.reply({
          content:
            'Você escolheu a opção de mensagem. Para personalizar sua mensagem, visite o site https://glitchii.github.io/embedbuilder/. Por favor, lembre-se das variáveis de parcerias disponíveis na nossa documentação. Você tem 5 minutos para enviar a mensagem de agradecimento de parcerias ou digite cancelar para anular a nova mensagem.',
        });
        const filter = m => interaction.user.id === m.author.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 300000,
          max: 1,
        });

        collector.on('collect', async m => {
          if (m.content === 'cancelar') return 0;
          try {
            const pe = JSON.parse(m.content);
            interaction.channel.send(pe).catch(() => {
              return interaction.channel.send(
                'A Mensagem que você enviou está com erros para ser testada, mas não se preocupe a verificação principal foi certificada!',
              );
            });
            doc.partnerWarning.message = m.content;
            doc.save();
          } catch (err) {
            return interaction.channel.send(
              'Seu JSON é inválido para minha inteligência, veja se você copiou tudo!',
            );
          }
        });
        break;
      }
      case 'canal': {
        const channel = interaction.options.getChannel('canal');
        interaction.reply('Definido com sucesso para esse canal.');
        doc.partnerWarning.channel = channel.id;
        doc.save();
        break;
      }
      case 'ativar': {
        doc.partnerWarning.activated = !doc.partnerWarning.activated;
        doc.save();
        interaction.reply(
          `Defini o agradecimento de parcerias para ${
            doc.partnerWarning.activated ? 'ativado' : 'desativado'
          }.`,
        );
        break;
      }
      case 'info': {
        const emb = new discord.EmbedBuilder()
          .setTitle('Como funciona?')
          .setColor(client.cor)
          .setDescription(
            'Este é um sistema muito simples, cada vez que um staff de parceria fizer uma parceria, eu irei avisar uma mensagem totalmente á sua escolha, com algumas variáveis pré-definidas, basta apenas usar todos os comandos de forma correta.',
          );
        interaction.reply({ embeds: [emb] });
        break;
      }
    }
  },
};
