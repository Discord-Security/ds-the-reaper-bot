const discord = require('discord.js');
const { inspect } = require('util');

module.exports = async (client, interaction) => {
  if (interaction.user.id !== '354233941550694400') return;
  interaction.deferUpdate();
  interaction.channel.send({
    content: 'Escreva um código.',
  });
  const filter = m => interaction.user.id === m.author.id;
  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 300000,
    max: 1,
  });

  collector.on('collect', async message => {
    let code = message.content;

    const nocode = new discord.EmbedBuilder()
      .setAuthor({ name: '» Digite algum código', iconURL: client.warn })
      .setColor(client.cor);
    if (!code) return message.channel.send({ embeds: [nocode] });
    const user = id => client.users.cache.find(user => user.id == id);
    const canal = id => client.channels.cache.find(c => c.id == id);
    const role = id => message.guild.roles.cache.find(r => r.id == id);
    const ufetch = id => client.users.fetch(r => r.id == id);

    if (message.content.includes('token')) {
      const wd = new discord.EmbedBuilder()
        .setAuthor({
          name: '» [Watch Dogs] ESTE BOT ESTÁ PROTEGIDO COM SISTEMA WATCH DOGS!',
          iconURL: client.err,
        })
        .setColor(client.cor);
      return message.reply({ embeds: [wd] });
    }

    code = code.replace(/^`{3}(js)?|`{3}$/g, '');
    code = code.replace(/<@!?(\d{16,18})>/g, 'user($1)');
    code = code.replace(/<@!?(\d{16,18})>/g, 'ufetch($1)');
    code = code.replace(/<#?(\d{16,18})>/g, 'canal($1)');
    code = code.replace(/<@&?(\d{16,18})>/g, 'role($1)');

    let result;

    try {
      const evaled = await eval(code);
      result = inspect(evaled, { depth: 0 });
    } catch (error) {
      result = error.toString();
    }
    result = result.replace(/_user\((\d{16,18})\)/g, '<@$1>');
    message.channel.send(result.slice(0, 1030 - 11), { code: 'js' });
  });
};
