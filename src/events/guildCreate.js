const discord = require('discord.js');

module.exports = async (client, guild) => {
  const approve = new discord.ButtonBuilder()
    .setCustomId('approve-' + guild.id)
    .setLabel('Aprovar')
    .setStyle(2)
    .setEmoji('1026116735759302727');
  const reject = new discord.ButtonBuilder()
    .setCustomId('reject-' + guild.id)
    .setLabel('Rejeitar')
    .setStyle(2)
    .setEmoji('1026116707770712136');
  const row = new discord.ActionRowBuilder().setComponents(approve, reject);
  const embed = new discord.EmbedBuilder()
    .setTitle(guild.name)
    .addFields([
      { name: '👑 Dono:', value: guild.ownerId, inline: true },
      {
        name: '👥 Usuários:',
        value: guild.memberCount.toString(),
        inline: true,
      },
      { name: '🆔', value: guild.id.toString(), inline: true },
    ])
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor(client.cor);

  client.channels.cache
    .get('1025774984402059436')
    .send({ embeds: [embed], components: [row] });

  client.db.Reaper.findOne({ _id: '1' }, async reaper => {
    if (reaper.databaseExclude.find(item => item._id === guild.id)) {
      reaper.databaseExclude.pull({ _id: guild.id });
      reaper.save();
    } else {
      new client.db.Guilds({ _id: guild.id }).save();
    }
  });
};
