const discord = require('discord.js');

module.exports = async (client, message) => {
  if (message.author.bot) return 0;

  const doc = await client.db.Guilds.findOne({ _id: message.guild.id });

  if (
    doc &&
    doc.logs.deletedMessage !== '' &&
    doc.logs.deletedMessage !== undefined &&
    doc.logs.deletedMessage !== null
  ) {
    const embed = new discord.EmbedBuilder()
      .setDescription(`***${message.author.tag}* | Mensagem __Deletada__**`)
      .setColor(client.cor)
      .addFields(
        {
          name: 'Conteúdo da Mensagem:',
          value: message.content.substr(0, 1024)
            ? message.content.substr(0, 1024)
            : 'Nada',
        },
        { name: 'Canal:', value: `<#${message.channel.id}>` },
        message.attachments.size >= 1
          ? {
              name: 'Arquivos:',
              value: `${message.attachments.map(a => a.url)}`,
            }
          : {
              name: 'Arquivos:',
              value: 'Sem arquivos encontrados nesta mensagem.',
            },
      )
      .setImage('https://i.imgur.com/Youft1w.png')
      .setFooter({ text: 'ID do Usuário: ' + message.author.id });

    client.trySend(
      doc.logs.deletedMessage,
      message.guild,
      { embeds: [embed] },
      'logs de entrada de membros',
    );
  }
};
