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

  const reaper = await client.db.Reaper.findOne({ _id: '1' });
  if (reaper) {
    const _date = new Date();
    _date.setHours(_date.getHours() + 6);
    const date = new Date(_date);
    reaper.databaseExclude.push({
      _id: guild.id,
      schedule: date,
    });
    reaper.save();
  }

  setTimeout(async () => {
    const reaper = await client.db.Reaper.findOne({ _id: '1' });
    if (reaper) {
      if (reaper.databaseExclude.find(item => item._id === guild.id)) {
        const doc = await client.db.Guilds.findOne({ _id: guild.id });
        if (doc && doc.roleId) {
          const role = client.guilds.cache
            .get('1025774982980186183')
            .roles.cache.get(doc.roleId);
          if (!role) return 0;
          if (role.members)
            role.members.map(member => {
              if (member.roles.length > 2) return 0;
              member.roles.remove('1025774982980186186');
              return member.roles.add('1055623367937507438');
            });
          role.delete();
        }
        await client.db.Guilds.deleteOne({ _id: guild.id });
        reaper.databaseExclude.pull({ _id: guild.id });
        reaper.save();
      }
    }
  }, 21600000);
};
