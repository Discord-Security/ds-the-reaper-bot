const discord = require('discord.js');
const ms = require('ms-pt-br');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('automessage')
    .setNameLocalizations({
      'pt-BR': 'automensagem',
      'en-US': 'automessage',
    })
    .setDescription('Ative ou desative o sistema de automensagem!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adiciona um canal ao sistema de autopublicar.')
        .setNameLocalizations({ 'pt-BR': 'adicionar', 'en-US': 'add' })
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildText)
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('tempo')
            .setNameLocalizations({ 'pt-BR': 'tempo', 'en-US': 'time' })
            .setDescription('Identifique o tempo (Ex: 10m, 6h, 1d)')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setNameLocalizations({ 'pt-BR': 'mensagem', 'en-US': 'message' })
            .setDescription('Identifique a mensagem')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove uma mensagem do sistema.')
        .setNameLocalizations({ 'pt-BR': 'remover', 'en-US': 'remove' })
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setNameLocalizations({ 'pt-BR': 'mensagem', 'en-US': 'message' })
            .setDescription('Identifique a mensagem')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setNameLocalizations({ 'pt-BR': 'lista', 'en-US': 'list' })
        .setDescription('Lista todas as mensagens do sistema.'),
    ),
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const choices = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    }).automessage;
    const filtered = choices.filter(choice =>
      choice._id.toLowerCase().includes(focusedValue.toLowerCase()),
    );
    await interaction.respond(
      filtered.map(choice => ({ name: choice._id, value: choice._id })),
    );
  },
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const channel = interaction.options.getChannel('canal') || null;
    const tempo = interaction.options.getString('tempo') || null;
    const mensagem = interaction.options.getString('mensagem') || null;
    const doc = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    });
    switch (subcommand) {
      case 'add': {
        doc.automessage.push({
          _id: mensagem,
          interval: ms(tempo),
          channel: channel.id,
        });
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        setInterval(async () => {
          const doc2 = await client.db.Guilds.findOne({
            _id: interaction.guild.id,
          });
          if (doc2.automessage.find(c => c._id === mensagem))
            channel.send(mensagem);
        }, ms(tempo));
        break;
      }
      case 'remove': {
        doc.automessage.pull({
          _id: mensagem,
        });
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'list': {
        interaction.reply({
          content: `Aqui está a lista de mensagens que utilizam o sistema de autopublicar:\n\n${doc.automessage
            .map(am => {
              return `${am._id} | ${am.channel} | ${ms(am.interval, {
                long: true,
              })}`;
            })
            .join('\n')}`,
          ephemeral: true,
        });
        break;
      }
    }
  },
};
