const discord = require('discord.js');

module.exports = async (client, guild) => {
  const embed = new discord.EmbedBuilder()
    .setTitle(guild.name)
    .addFields([{ name: '🆔', value: guild.id.toString(), inline: true }])
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor(client.cor);

  client.channels.cache.get('1025774984402059437').send({ embeds: [embed] });

  client.channels.cache.get(client.canais.strikes).send({
    content: `<@${guild.ownerId}>, seu servidor ${guild.name} me retirou, me adicione novamente e peça por aprovação a um dos administradores! Ao eu ser retirado de um servidor, excluo todos os dados definidos como canais de logs, welcomes e aprovações dentro de 6 horas.`,
  });

  client.db.Reaper.findOne({ _id: '1' }, async reaper => {
    const _date = new Date();
    _date.setHours(_date.getHours() + 6);
    const date = new Date(_date);
    reaper.databaseExclude.push({
      _id: guild.id,
      schedule: date,
    });
    reaper.save();
  });

  setTimeout(async () => {
    client.db.Reaper.findOne({ _id: '1' }, async reaper => {
      if (reaper.databaseExclude.find(item => item._id === guild.id)) {
        await client.db.Guilds.deleteOne({ _id: guild.id });
      }
    });
  }, 21600000);
};
