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

  const reaper = await client.db.Reaper.findOne({ _id: '1' });
  if (reaper) {
    if (reaper.databaseExclude.find(item => item._id === guild.id)) {
      reaper.databaseExclude.pull({ _id: guild.id });
      reaper.save();
    } else {
      new client.db.Guilds({ _id: guild.id }).save();
    }
  }
  guild.channels
    .create({
      name: 'reaper',
      type: discord.ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [discord.PermissionFlagsBits.ViewChannel],
          deny: [discord.PermissionFlagsBits.SendMessages],
        },
      ],
    })
    .then(c => {
      const embed = new discord.EmbedBuilder()
        .setColor(client.cor)
        .setImage('https://i.imgur.com/0hXzJPr.png')
        .setTitle('Este servidor está seguro com The Reaper')
        .setDescription(
          'Oi, sou o The Reaper, um bot de proteção para o Discord. Meu trabalho é manter todos os servidores limpos e seguros, removendo usuários tóxicos que possam causar problemas ou violar as regras. Já bani mais de 15 mil usuários desde que fui criado e estou comprometido em fornecer o melhor serviço para todos os criadores de servidores. Se você seguir as regras do Discord, pode contar comigo para ajudar a manter a ordem e a paz no seu servidor.\n\nEu sou capaz de banir usuários que tenham cometido infrações graves, como o envio de spam ou o uso de linguagem imprópria em todos os servidores ao mesmo tempo. Meu sistema é rápido e eficaz para remover rapidamente os usuários problemáticos e evitar danos ou incômodos aos outros membros do servidor.\n\nSe você quer ter certeza de que seu servidor está protegido contra usuários tóxicos, eu sou a escolha certa para você. Para ter acesso ao meu serviço, você precisará se [candidatar à minha rede](https://discord.gg/TnvvwUStHK). Lembre-se de que o meu foco é a segurança dos servidores, portanto, todas as alianças, projetos e redes não devem se importar em bloquear o uso do bot para membros que não estejam na rede de segurança. A rede também é o lugar onde você pode acompanhar as novidades e avisos de segurança.',
        );
      const row = new discord.ActionRowBuilder().setComponents(
        new discord.ButtonBuilder()
          .setStyle(discord.ButtonStyle.Link)
          .setURL('https://discord.gg/TnvvwUStHK')
          .setLabel('Participar!')
          .setEmoji('1041100297629597836'),
      );
      c.send({ embeds: [embed], components: [row] });
    })
    .catch(() => {
      return 0;
    });
};
