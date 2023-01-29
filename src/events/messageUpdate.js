const discord = require('discord.js');

module.exports = async (client, oldmessage, message) => {
  if (message.guild === null) return;
  if (message.author.bot) return 0;

  if (oldmessage.content === message.content) return;

  const doc = await client.db.Guilds.findOne({ _id: message.guild.id });

  if (
    doc &&
    doc.logs.editedMessage !== '' &&
    doc.logs.editedMessage !== undefined &&
    doc.logs.editedMessage !== null
  ) {
    const embed = new discord.EmbedBuilder()
      .setDescription(`***${message.author.tag}* | Mensagem __Editada__**`)
      .setColor(client.cor)
      .addFields([
        {
          name: 'Conteúdo da Mensagem Antigo: ',
          value: oldmessage.content.substr(0, 1024)
            ? oldmessage.content.substr(0, 1024)
            : 'Nada'
        },
        {
          name: 'Conteúdo da Mensagem Novo:',
          value: message.content.substr(0, 1024)
            ? message.content.substr(0, 1024)
            : 'Nada'
        },
        { name: 'Canal:', value: `<#${message.channel.id}>` },
        message.attachments.size >= 1
          ? {
              name: 'Arquivos:',
              value: `${message.attachments.map(a => a.url)}`
            }
          : {
              name: 'Arquivos:',
              value: 'Sem arquivos encontrados nesta mensagem.'
            }
      ])
      .setImage('https://i.imgur.com/thr2RcM.png')
      .setFooter({ text: 'ID do Usuário: ' + message.author.id });

    client.channels.cache.get(doc.logs.editedMessage).send({ embeds: [embed] });
  }
};
