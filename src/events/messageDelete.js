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
    const fields = [
      { name: 'Canal:', value: message.channel.toString() },
    ];

    if (message.content) {
      fields.unshift({
        name: 'Conteúdo da Mensagem:',
        value: `\`\`\`ansi\n[2;31m${message.content.substr(0, 1024)}[0m[2;31m[0m\n\`\`\``,
        inline: false,
      });
    }

    if (message.attachments.size >= 1) {
      fields.push({
        name: 'Arquivos:',
        value: `${message.attachments.map(a => a.url)}`,
      });
    }
    const embed = new discord.EmbedBuilder()
      .setDescription(`***${message.author.tag}* | Mensagem __Deletada__**`)
      .setColor(client.cor)
      .addFields(fields)
      .setImage('https://i.imgur.com/Youft1w.png')
      .setFooter({ text: 'ID do Usuário: ' + message.author.id });

    client.trySend(
      doc.logs.deletedMessage,
      message.guild,
      { embeds: [embed] },
      'logs de mensagem apagada',
    );
  }
};
