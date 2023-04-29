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
        choice.name.toLowerCase().includes(focusedValue.toLowerCase()),
      );
      await interaction.respond(
        filtered.map(choice => ({ name: choice.name, value: choice.value })),
      );
    }

    if (focusedValue.name === 'feed') {
      const choices = await client.db.Guilds.findOne({
        _id: interaction.guild.id,
      }).rssfeeds;
      const filtered = choices.filter(
        choice => choice._id.toLowerCase() === focusedValue.value.toLowerCase(),
      );
      await interaction.respond(
        filtered.map(choice => ({ name: choice._id, value: choice._id })),
      );
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
        doc.rssfeeds.push({ _id: url, canal: canal.id });
        doc.save();
        interaction.reply({ content: 'Feito com sucesso.' });
        break;
      }
      case 'editar': {
        interaction.reply('Em breve...');
        break;
      }
      case 'apagar': {
        doc.automessage.pull({
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
