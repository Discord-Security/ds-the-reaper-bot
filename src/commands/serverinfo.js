const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('serverinfo')
    .setNameLocalizations({
      'pt-BR': 'servidor_info',
      'en-US': 'serverinfo',
    })
    .setDescription('Informações do servidor')
    .addStringOption(option =>
      option
        .setName('id_server')
        .setNameLocalizations({
          'pt-BR': 'id_servidor',
          'en-US': 'id_server',
        })
        .setDescription('Identifique o ID do servidor')
        .setRequired(false)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused(true);
    const choices = await Promise.all(
      client.guilds.cache
        .filter(sv => sv.id.includes(focusedValue.value))
        .map(async choice => ({
          name: await client.guilds
            .fetch(choice.id)
            .then(guild => guild.name.slice(0, 25)),
          value: choice.id,
        })),
    );
    console.log(choices.slice(0, 25));
    await interaction.respond(choices.slice(0, 25));
  },
  async execute(interaction, client) {
    const guild = client.guilds.cache.get(
      interaction.options.getString('id_server') || interaction.guild.id,
    );

    if (!guild)
      return interaction.reply({ content: 'Servidor não encontrado.' });

    const serverInfoEmbed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ format: 'png', width: 512 }))
      .addFields(
        {
          name: '<:Discord_Owner:1120112684038365214> Dono',
          value: `<@${guild.ownerId}> (${guild.ownerId})`,
          inline: true,
        },
        {
          name: '<:Discord_Staff:1028818928383836311> Membros Totais',
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: '<:Discord_Integration:1120112458166710302> Contagem de Usuários / Bots',
          value: `${
            guild.members.cache.filter(member => !member.user.bot).size
          } / ${guild.members.cache.filter(member => member.user.bot).size}`,
          inline: true,
        },
        {
          name: '<:Discord_Channel:1035624104264470648> Canais de Texto / Voz',
          value: `${
            guild.channels.cache.filter(
              channels => channels.type === discord.ChannelType.GuildText,
            ).size
          } / ${
            guild.channels.cache.filter(
              c => c.type === discord.ChannelType.GuildVoice,
            ).size
          }`,
          inline: true,
        },
        {
          name: '<:Discord_Role:1041100114762149958> Cargos',
          value: `${guild.roles.cache.size}`,
          inline: true,
        },
      );

    await interaction.reply({ embeds: [serverInfoEmbed] });
  },
};
