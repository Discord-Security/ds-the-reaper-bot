const discord = require('discord.js');

module.exports = async (client, interaction) => {
  const id = interaction.customId.replace('approve-', '');

  interaction.reply({
    content: `Prontinho, Servidor ${id} aprovado com sucesso!`,
  });
  
  client.channels.cache.get('1025774984037146686').send({
    content: `<:Discord_Join:1041100297629597836> O servidor ${
      client.guilds.cache.get(id).name
    } foi aprovado na nossa rede. Boas-vindas e espero que gostem da nossa rede!`,
  });

  const guild = await client.db.Guilds.findOne({ _id: id });

  if (guild) {
    guild.approved = true;
    guild.save();
  } else {
    new client.db.Guilds({ _id: id, approved: true }).save();
  }

  const guilds = await client.db.Guilds.find({ approved: true });

  const emb = new discord.EmbedBuilder()
    .setColor(client.cor)
    .setTitle('Servidores no The Reaper!')
    .setImage('https://i.imgur.com/BAwY6H0.png')
    .setDescription(
      `Atualmente temos ${guilds.length} servidores na nossa rede: \n\n` +
        guilds
          .sort((a, b) => {
            const a1 = client.guilds.cache.get(a._id);
            const b1 = client.guilds.cache.get(b._id);
            const a1name = a1
              ? a1.name
                  .replace(
                    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|)/g,
                    '',
                  )
                  .replace('  ', ' ')
              : '';
            const b1name = b1
              ? b1.name
                  .replace(
                    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|)/g,
                    '',
                  )
                  .replace('  ', ' ')
              : '';
            return (a1 ? a1name : a._id) < (b1 ? b1name : b._id)
              ? -1
              : (a1 ? a1name : a._id) > (b1 ? b1name : b._id)
              ? 1
              : 0;
          })
          .map(guild => {
            const nome = client.guilds.cache.get(guild._id);
            return `\`\`\`✙ ${
              nome
                ? nome.name
                    .replace(
                      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|)/g,
                      '',
                    )
                    .replace('  ', ' ')
                : guild._id
            }\`\`\``;
          })
          .join(''),
    );

  client.channels.cache
    .get('1040362329868607629')
    .messages.fetch({ limit: 1 })
    .then(msg => {
      const fetchedMsg = msg.first();
      fetchedMsg.edit({ content: '', embeds: [emb] });
    });
};
