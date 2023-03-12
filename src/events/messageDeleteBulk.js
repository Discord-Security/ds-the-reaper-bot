const discord = require('discord.js');

module.exports = async (client, messages) => {
  const message = messages.first();
  const doc = await client.db.Guilds.findOne({ _id: message.guild.id });

  if (
    doc &&
    doc.logs.deletedMessage !== '' &&
    doc.logs.deletedMessage !== undefined &&
    doc.logs.deletedMessage !== null
  ) {
    const embed = new discord.EmbedBuilder()
      .setDescription(`**Mensagens __Deletadas__**`)
      .setColor(client.cor)
      .addFields(
        {
          name: 'Conteúdo das Mensagens:',
          value: 'No arquivo .TXT',
        },
        { name: 'Canal:', value: `<#${message.channel.id}>` },
      )
      .setImage('https://i.imgur.com/Youft1w.png');

    const msgs = messages
      .map(message => `[${message.author.tag}]: ${message.content}`)
      .join('\n');

    const lista = await new discord.AttachmentBuilder(Buffer.from(msgs), {
      name: 'messageDeleteBulk.txt',
    });

    client.trySend(
      doc.logs.deletedMessage,
      message.guild,
      { embeds: [embed], files: [lista] },
      'logs de mensagem apagada',
    );
  }
};
