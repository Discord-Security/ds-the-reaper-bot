const discord = require('discord.js');

module.exports = async (client, channel) => {
  if (channel.type === discord.ChannelType.GuildVoice || channel.type === discord.ChannelType.GuildStageVoice) return;
  if (channel.name.startsWith("ticket-") || channel.name.startsWith("closed-")) return;
  let author = null;
  await channel.guild
    .fetchAuditLogs({ type: 12, limit: 3 })
    .then(logs => logs.entries.find(entry => entry.target.id === channel.id))
    .then(entry => {
      author = entry.executor;
    })
    .catch(error => {
      if (error) return 0;
    });

  const embed = new discord.EmbedBuilder()
    .setTitle('Canal apagado - ' + channel.guild.name)
    .addFields([
      {
        name: '🆔 Servidor:',
        value: channel.guild.id.toString(),
        inline: true,
      },
      {
        name: '🆔 Canal',
        value: `${channel.name !== null ? channel.name : ''} ${channel.id}`,
        inline: true,
      },
      {
        name: '👦 Autor:',
        value: author === null ? 'Desconhecido' : `${author.tag} ${author.id}`,
        inline: true,
      },
    ])
    .setThumbnail(channel.guild.iconURL({ dynamic: true }))
    .setColor(client.cor);

  client.channels.cache.get(client.canais.raidAlerts).send({ embeds: [embed] });
};
