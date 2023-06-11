const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('rss')
    .setDescription('Faça RSS Feeds para o seu servidor')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('criar')
        .setNameLocalizations({ 'pt-BR': 'criar', 'en-US': 'create' })
        .setDescription('Crie uma cópia de segurança do seu servidor')
        .addStringOption(option =>
          option
            .setName('url')
            .setDescription(
              'Indique uma URL de um RSS Feed. Ex: https://imperionetwork.ml/feed',
            )
            .setAutocomplete(true)
            .setRequired(true),
        )
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'canal' })
            .setDescription('Indique um canal para publicar')
            .setRequired(true)
            .addChannelTypes(discord.ChannelType.GuildText),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('editar')
        .setNameLocalizations({ 'pt-BR': 'editar', 'en-US': 'edit' })
        .setDescription(
          'Edita uma fonte RSS Feed do seu servidor para a mensagem, canal ou URL.',
        )
        .addStringOption(option =>
          option
            .setName('feed')
            .setDescription('Indique um dos feeds acima.')
            .setAutocomplete(true)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('apagar')
        .setNameLocalizations({ 'pt-BR': 'apagar', 'en-US': 'remove' })
        .setDescription('Apaga uma fonte RSS do seu servidor.')
        .addStringOption(option =>
          option
            .setName('feed')
            .setDescription('Indique um dos feeds acima.')
            .setAutocomplete(true)
            .setRequired(true),
        ),
    ),
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused(true);

    if (focusedValue.name === 'url') {
      const choices = [
        {
          name: 'G1 - Notícias Locais BR',
          value: 'https://g1.globo.com/rss/g1/',
        },
        {
          name: 'CNN Portugal - Notícias Locais PT',
          value: 'https://cnnportugal.iol.pt/rss.xml',
        },
        {
          name: 'CMTV - Notícias Locais PT',
          value: 'https://www.cm-tv.pt/rss',
        },
        {
          name: 'Império Network - Gaming',
          value: 'https://imperionetwork.ml/feed',
        },
        {
          name: 'GameVício - Gaming',
          value: 'https://www.gamevicio.com/rss/noticias.xml',
        },
        {
          name: 'AnimeNew - Animes',
          value: 'https://animenew.com.br/feed/',
        },
        {
          name: 'Tecmundo - Tecnologia',
          value: 'https://rss.tecmundo.com.br/feed',
        },
        {
          name: 'Portal POPline - Música',
          value: 'https://portalpopline.com.br/feed/',
        },
        {
          name: 'CAFÉ COM NERD - Filmes/Séries',
          value: 'https://cafecomnerd.com.br/feed/',
        },
        {
          name: 'Online Séries - Filmes/Séries',
          value: 'https://onlineseries.com.br/feed/',
        },
      ];
      const filtered = choices.filter(choice =>
        choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()),
      );
      await interaction.respond(
        filtered.map(choice => ({ name: choice.name, value: choice.value })),
      );
    }

    if (focusedValue.name === 'feed') {
      const guild = await client.db.Guilds.findOne({
        _id: interaction.guild.id,
      });

      if (guild && guild.rssfeeds) {
        const filtered = guild.rssfeeds.filter(choice =>
          choice._id.toLowerCase().includes(focusedValue.value.toLowerCase()),
        );
        await interaction.respond(
          filtered.map(choice => ({ name: choice._id, value: choice._id })),
        );
      } else {
        await interaction.respond({
          name: 'Não há nada listado.',
          value: 'Não há nada listado.',
        });
      }
    }
  },
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const doc = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    });
    const feed = interaction.options.getString('feed') || null;
    switch (subcommand) {
      case 'criar': {
        const url = interaction.options.getString('url');
        const canal = interaction.options.getChannel('canal');
        doc.rssfeeds.push({ _id: url, channel: canal.id, disabled: false, lastItem: "a", penultimateItem: "a" });
        doc.save();
        interaction.reply({ content: 'Feito com sucesso.' });
        break;
      }
      case 'editar': {
        const rssFeed = doc.rssfeeds.id(feed);
        if (!rssFeed)
          return interaction.reply({ content: 'Nada foi encontrado.' });
        const emb = new discord.EmbedBuilder()
          .setColor(client.cor)
          .setTitle((!rssFeed.disabled ? '🟢' : '🔴') + ' Alterar RSS')
          .addFields([
            {
              name: '<:Discord_Star:1038602481640407050> Link RSS',
              value: rssFeed._id,
              inline: true,
            },
            {
              name: '<:Discord_Channel:1035624104264470648> Canal',
              value: `<#${rssFeed.channel}>`,
            },
            {
              name: '<:Discord_Chat:1035624171960541244> Mensagem',
              value: `\`${rssFeed.message}\``,
            },
          ]);
        const row = new discord.ActionRowBuilder().setComponents(
          new discord.ButtonBuilder()
            .setCustomId('link')
            .setLabel('Mudar link')
            .setStyle(discord.ButtonStyle.Secondary),
          new discord.ButtonBuilder()
            .setCustomId('mensagem')
            .setLabel('Alterar mensagem')
            .setStyle(discord.ButtonStyle.Secondary),
          new discord.ButtonBuilder()
            .setCustomId('canal')
            .setLabel('Mudar canal')
            .setStyle(discord.ButtonStyle.Secondary),
        );
        const row2 = new discord.ActionRowBuilder().setComponents(
          new discord.ButtonBuilder()
            .setCustomId('estado')
            .setLabel(rssFeed.disabled ? 'Ativar' : 'Desativar')
            .setStyle(
              rssFeed.disabled
                ? discord.ButtonStyle.Success
                : discord.ButtonStyle.Danger,
            ),
        );
        interaction
          .reply({ embeds: [emb], components: [row, row2] })
          .then(msg => {
            const collector = msg.createMessageComponentCollector({
              componentType: discord.ComponentType.Button,
              time: 300000,
            });
            collector.on('collect', i => {
              if (i.user.id === interaction.user.id) {
                switch (i.customId) {
                  case 'estado': {
                    i.reply(
                      `${
                        !rssFeed.disabled ? 'Desativado' : 'Ativado'
                      } com sucesso`,
                    );
                    rssFeed.disabled = !rssFeed.disabled;
                    doc.save();
                    break;
                  }
                  case 'link': {
                    i.reply({ content: 'Envie o novo link RSS.' });
                    const collector =
                      interaction.channel.createMessageCollector({
                        filter: m => m.author.id === interaction.author.id,
                        time: 300000,
                        max: 1,
                      });

                    collector.on('collect', m => {
                      if (
                        !m.content.startsWith('http://') ||
                        !m.content.startsWith('https://')
                      )
                        return m.reply('Link inválido.');
                      rssFeed._id = m.content;
                      doc.save();
                      m.reply('Definido com sucesso.');
                    });
                    break;
                  }
                  case 'canal': {
                    i.reply({ content: 'Envie uma menção de um canal.' });
                    const collector =
                      interaction.channel.createMessageCollector({
                        filter: m => m.author.id === interaction.author.id,
                        time: 300000,
                        max: 1,
                      });

                    collector.on('collect', m => {
                      const channelId = m.content.match(/\d+/)[0];
                      if (!channelId)
                        return m.reply({
                          content: 'Envie uma menção de um canal válido.',
                        });
                      rssFeed.channel = channelId;
                      doc.save();
                    });
                    break;
                  }
                  case 'mensagem': {
                    i.reply({
                      content:
                        'Você selecionou a opção de Mensagem. Para isso você poderá personalizar toda a sua mensagem neste site: https://glitchii.github.io/embedbuilder/ , tendo em conta as variáveis do RSS disponíveis em nossa documentação. Você tem 5 minutos para enviar a mensagem personalizada para este feed ou diga `cancelar` para ser anulada a nova mensagem.',
                    });
                    const filter = m => interaction.user.id === m.author.id;
                    const collector =
                      interaction.channel.createMessageCollector({
                        filter,
                        time: 300000,
                        max: 1,
                      });

                    collector.on('collect', async m => {
                      if (m.content === 'cancelar') return 0;
                      try {
                        const pe = JSON.parse(m.content);
                        interaction.channel.send(pe).catch(err => {
                          if (err)
                            return interaction.channel.send(
                              'A Mensagem que você enviou está com erros para ser testada, mas não se preocupe a verificação principal foi certificada!',
                            );
                        });
                        rssFeed.message = m.content;
                        doc.save();
                      } catch (err) {
                        return interaction.channel.send(
                          'Seu JSON é inválido para minha inteligência, veja se você copiou tudo certo!',
                        );
                      }
                    });
                    break;
                  }
                }
              } else {
                i.reply({
                  content: `Este botão não é para você usar!`,
                  ephemeral: true,
                });
              }
            });
          });

        break;
      }
      case 'apagar': {
        doc.rssfeeds.pull({
          _id: feed,
        });
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
    }
  },
};
