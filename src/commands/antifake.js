const discord = require('discord.js');
const ms = require('ms-pt-br');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('antifake')
    .setNameLocalizations({
      'pt-BR': 'antialt',
      'en-US': 'antifake',
    })
    .setDescription('Configure seu antifake!')
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
        .setName('tempo')
        .setNameLocalizations({ 'pt-BR': 'tempo', 'en-US': 'time' })
        .setDescription('Defina um tempo limite de criação de conta')
        .addStringOption(option =>
          option
            .setName('tempo')
            .setNameLocalizations({ 'pt-BR': 'tempo', 'en-US': 'time' })
            .setDescription('Identifique o tempo (ex: 1d, 1m, 1s)')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('punição')
        .setNameLocalizations({ 'pt-BR': 'punição', 'en-US': 'punishment' })
        .setDescription('Defina uma punição')
        .addStringOption(option =>
          option
            .setName('ação')
            .setNameLocalizations({ 'pt-BR': 'ação', 'en-US': 'action' })
            .setDescription('Identifique se a punição é Kick ou Ban.')
            .setRequired(true)
            .addChoices(
              { name: 'banir', value: 'Ban' },
              { name: 'expulsar', value: 'Kick' },
            ),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ativar')
        .setNameLocalizations({ 'pt-BR': 'ativar', 'en-US': 'activate' })
        .setDescription('Ative ou desative o seu sistema Anti-Fake.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const channel = interaction.options.getChannel('canal') || null;
    const time = interaction.options.getString('tempo') || null;
    switch (subcommand) {
      case 'canal': {
        const doc = await client.db.Guilds.findOne({
          _id: interaction.guild.id,
        });
        doc.antifake.channel = channel.id;
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'tempo': {
        const doc = await client.db.Guilds.findOne({
          _id: interaction.guild.id,
        });
        const intfinal = ms(time);
        if (!intfinal)
          return interaction.reply({
            content: 'Tempo Inválido! Teste utilizar 1d, 1h, 1m.',
          });
        doc.antifake.time = intfinal;
        doc.save();
        interaction.reply({ content: 'Sucesso!', ephemeral: true });
        break;
      }
      case 'punição': {
        const action = interaction.options.get('ação').value;
        const doc = await client.db.Guilds.findOne({
          _id: interaction.guild.id,
        });
        interaction.reply({
          content: `Eu defini para ${action
            .replace('Ban', 'banir')
            .replace(
              'Kick',
              'expulsar',
            )} usuários em seu servidor no anti-fake.`,
          ephemeral: true,
        });
        doc.antifake.action = action;
        doc.save();
        break;
      }
      case 'ativar': {
        const doc = await client.db.Guilds.findOne({
          _id: interaction.guild.id,
        });
        interaction.reply({
          content:
            'Alternado o sistema com Sucesso para ' +
            (doc.antifake.active ? 'ativado' : 'desativado'),
          ephemeral: true,
        });
        doc.antifake.active = !doc.antifake.active;
        doc.save();
        break;
      }
    }
  },
};
