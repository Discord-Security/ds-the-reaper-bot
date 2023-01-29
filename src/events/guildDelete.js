const discord = require('discord.js');

module.exports = async (client, guild) => {
  const embed = new discord.EmbedBuilder()
    .setTitle(guild.name)
    .addFields([
      { name: '🆔', value: guild.id.toString() || 'fe', inline: true }
    ])
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor(client.cor);

  client.channels.cache.get('1025774984402059437').send({ embeds: [embed] });

  client.channels.cache
    .get(client.canais.strikes)
    .send({
      content: `<@${guild.ownerId}>, seu servidor ${guild.name} me retirou, me adicione novamente e peça por aprovação a um dos administradores! Ao eu ser retirado de um servidor, excluo todos os dados definidos como canais de logs, welcomes e aprovações.`
    });

  await client.db.Guilds.deleteOne({ _id: guild.id });
};
