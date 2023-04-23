const discord = require('discord.js');

module.exports = async (client, role) => {
  if (
    role.permissions.has(discord.PermissionFlagsBits.BanMembers) ||
    role.permissions.has(discord.PermissionFlagsBits.KickMembers) ||
    role.permissions.has(discord.PermissionFlagsBits.ModerateMembers)
  )
    return;
  let author = null;
  await role.guild
    .fetchAuditLogs({ type: 32, limit: 3 })
    .then(logs => logs.entries.find(entry => entry.target.id === role.id))
    .then(entry => {
      author = entry.executor;
    })
    .catch(error => {
      if (error) return 0;
    });

  const embed = new discord.EmbedBuilder()
    .setTitle('Cargo apagado - ' + role.guild.name)
    .addFields([
      {
        name: '🆔 Servidor:',
        value: role.guild.id.toString(),
        inline: true,
      },
      {
        name: '🆔 Cargo',
        value: `**${
          role.name !== null || role.name !== undefined ? role.name : ''
        }** ${role.id}`,
        inline: true,
      },
      {
        name: '👦 Autor:',
        value:
          author === null ? 'Desconhecido' : `**${author.tag}** ${author.id}`,
        inline: true,
      },
    ])
    .setThumbnail(role.guild.iconURL({ dynamic: true }))
    .setColor(client.cor);

  client.channels.cache.get(client.canais.raidAlerts).send({ embeds: [embed] });
};
