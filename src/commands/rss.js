const discord = require('discord.js');
const { createPaste } = require('dpaste-ts');

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
              'Indique uma URL de um RSS Feed. Ex: https://imperionetwork.me/rss.xml',
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
          value: 'https://imperionetwork.me/rss.xml',
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
        return await interaction.respond({
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
        doc.rssfeeds.push({
          _id: url,
          channel: canal.id,
          disabled: false,
          lastItem: 'a',
          penultimateItem: 'a',
        });
        doc.save();
        interaction.reply({ content: 'Feito com sucesso.' });
        break;
      }
      case 'editar': {
        const rssFeed = doc.rssfeeds.id(feed);
        if (!rssFeed)
          return interaction.reply({ content: 'Nada foi encontrado.' });
        const paste = await createPaste({
          content: rssFeed.message,
          syntax: 'json',
        });
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
              value: `[No DPaste](${paste})`,
            },
          ]);
        const row = new discord.ActionRowBuilder().setComponents(
          new discord.ButtonBuilder()
            .setCustomId('estado')
            .setLabel(rssFeed.disabled ? 'Ativar' : 'Desativar')
            .setEmoji(
              rssFeed.disabled ? '1026116938608410647' : '1026116942202941561',
            )
            .setStyle(
              rssFeed.disabled
                ? discord.ButtonStyle.Success
                : discord.ButtonStyle.Danger,
            ),
          new discord.ButtonBuilder()
            .setCustomId('link')
            .setLabel('Mudar link')
            .setEmoji('1131743178484088883')
            .setStyle(discord.ButtonStyle.Secondary),
          new discord.ButtonBuilder()
            .setCustomId('mensagem')
            .setLabel('Alterar mensagem')
            .setEmoji('1035624171960541244')
            .setStyle(discord.ButtonStyle.Secondary),
          new discord.ButtonBuilder()
            .setCustomId('canal')
            .setLabel('Mudar canal')
            .setEmoji('1035624104264470648')
            .setStyle(discord.ButtonStyle.Secondary),
        );
        interaction.reply({ embeds: [emb], components: [row] }).then(msg => {
          const collector = msg.createMessageComponentCollector({
            componentType: discord.ComponentType.Button,
            time: 300000,
          });
          collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id)
              return i.reply({
                content: `Este botão não é para você usar!`,
                ephemeral: true,
              });

            switch (i.customId) {
              case 'estado': {
                i.reply({
                  content:
                    (!rssFeed.disabled ? 'Desativado' : 'Ativado') +
                    ' com sucesso',
                });
                rssFeed.disabled = !rssFeed.disabled;
                return doc.save();
              }
              case 'link': {
                const linkInput = new discord.TextInputBuilder()
                  .setCustomId('linkInput')
                  .setLabel('Qual o novo link RSS?')
                  .setValue(rssFeed._id)
                  .setRequired(true)
                  .setStyle(discord.TextInputStyle.Short);
                const modal = new discord.ModalBuilder()
                  .setCustomId('linkRSS')
                  .setTitle('Alteração de Link RSS')
                  .setComponents(
                    new discord.ActionRowBuilder().addComponents(linkInput),
                  );

                await i.showModal(modal);
                const enviada = await interaction
                  .awaitModalSubmit({
                    time: 3600000,
                    filter: i =>
                      i.user.id === interaction.user.id &&
                      i.customId === 'linkRSS',
                  })
                  .catch(error => {
                    if (error) return null;
                  });

                if (enviada) {
                  const link = await enviada.fields.getTextInputValue(
                    'linkInput',
                  );
                  if (
                    !link.startsWith('http://') &&
                    !link.startsWith('https://')
                  )
                    return enviada.reply('Link inválido.');
                  rssFeed._id = link;
                  doc.save();
                  enviada.reply('Atualizado com sucesso!');
                }
                break;
              }
              case 'canal': {
                i.reply({
                  content: 'Selecione um canal.',
                  components: [
                    new discord.ActionRowBuilder().setComponents(
                      new discord.ChannelSelectMenuBuilder()
                        .setChannelTypes(discord.ChannelType.GuildText)
                        .setMaxValues(1)
                        .setCustomId('canal'),
                    ),
                  ],
                }).then(m => {
                  const collector = m.createMessageComponentCollector({
                    componentType: discord.ComponentType.ChannelSelect,
                    time: 300000,
                    max: 1,
                  });
                  collector.on('collect', i => {
                    if (i.user.id === interaction.user.id) {
                      i.reply({ content: 'Sucesso!' });
                      rssFeed.channel = i.values[0];
                      doc.save();
                    }
                  });
                });
                break;
              }
              case 'mensagem': {
                const mensagemInput = new discord.TextInputBuilder()
                  .setCustomId('mensagemInput')
                  .setLabel('Qual a mensagem?')
                  .setValue(
                    'Você selecionou a opção de Mensagem. Para isso você poderá personalizar toda a sua mensagem neste site através de JSON: https://glitchii.github.io/embedbuilder/ , tendo em conta as variáveis do RSS disponíveis em nossa documentação.',
                  )
                  .setRequired(true)
                  .setPlaceholder(rssFeed.message)
                  .setStyle(discord.TextInputStyle.Paragraph);
                const modal = new discord.ModalBuilder()
                  .setCustomId('mensagemRSS')
                  .setTitle('Alterar Mensagem')
                  .setComponents(
                    new discord.ActionRowBuilder().addComponents(mensagemInput),
                  );

                await i.showModal(modal);
                const enviada = await interaction
                  .awaitModalSubmit({
                    time: 3600000,
                    filter: i =>
                      i.user.id === interaction.user.id &&
                      i.customId === 'mensagemRSS',
                  })
                  .catch(error => {
                    if (error) return null;
                  });

                if (enviada) {
                  const mensagem =
                    enviada.fields.getTextInputValue('mensagemInput');
                  enviada.reply('Atualizado com sucesso!');
                  try {
                    const pe = JSON.parse(mensagem);
                    interaction.channel.send(pe).catch(err => {
                      if (err) return 0;
                    });
                    rssFeed.message = mensagem;
                    doc.save();
                  } catch (err) {
                    return interaction.channel.send(
                      'Seu JSON é inválido para minha inteligência, veja se você copiou tudo certo!',
                    );
                  }
                }
                break;
              }
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
