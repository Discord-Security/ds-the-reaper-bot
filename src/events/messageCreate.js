const discord = require('discord.js');

module.exports = async (client, message) => {
  if (message.guild === null) return;

  const doc = await client.db.Guilds.findOne({ _id: message.guild.id });

  if (!doc) return new client.db.Guilds({ _id: message.guild.id }).save();

  if (
    doc.channelsAutopublish.includes(message.channel.id) &&
    message.content !== '<@&813074590456741888>' &&
    message.content !== '<@&813074615147692042>'
  ) {
    message.crosspost().catch(err => {
      if (err) return 0;
    });
  }

  if (message.author.bot) return;

  if (
    doc.partnerWarning.activated &&
    message.channel.id === doc.partnerWarning.channel
  ) {
    const id = `${message.author.id}-${message.guild.id}`;
    const db = await client.db.Partners.findOne({
      _id: id,
      serverId: message.guild.id,
    });
    if (db) {
      db.partners += 1;
      db.save();
    } else {
      new client.db.Partners({
        _id: id,
        serverId: message.guild.id,
        partners: 1,
      }).save();
    }
    const partners = await client.db.Partners.find({
      serverId: message.guild.id,
    }).sort({ partners: 1 });
    const partner = await client.db.Partners.findOne({
      _id: id,
      serverId: message.guild.id,
    });
    const membroRank =
      partners.reduce((prev, curr) => {
        if (curr.partners >= partner.partners) {
          return prev + 1;
        }
        return prev;
      }, 0) + 1;

    const idRegex = /<@(\d+)>/;
    const match = message.content.match(idRegex);
    const serverNome = message.guild.name;
    const serverId = message.guild.id;
    const serverIcon = await message.guild.iconURL({
      extension: 'png',
      dynamic: true,
    });
    const avatar = await message.author.displayAvatarURL({
      extension: 'png',
      dynamic: true,
    });
    const replaced = await doc.partnerWarning.message
      .replace('%membroTag', message.author.tag)
      .replace('%membroId', message.author.id)
      .replace('%membroMenção', `<@${message.author.id}>`)
      .replace('%membroRank', membroRank || 0)
      .replace('%membroParcerias', db ? db.partners : 1)
      .replace('"%membroAvatar"', `"${avatar}"`)
      .replace('%serverNome', serverNome)
      .replace('%serverId', serverId)
      .replace('"%serverIcon"', `"${serverIcon}"`)
      .replace('%representante', match !== null ? match[0] : 'Desconhecido');

    // %membro é o utilizador que enviou a mensagem, %membroparcerias é o número total de parcerias que a pessoa fez +1, %membrorank é o número do rank que ela está naquele servidor.
    client.trySend(
      doc.partnerWarning.channel,
      message.guild,
      JSON.parse(replaced),
      'mensagem de parceria',
    );
  }

  if (message.guild.id === '1025774982980186183') {
    client.channels.cache
      .get('1037138353369382993')
      .threads.fetch(message.channel.id)
      .then(thread => {
        if (thread.messageCount > 1) return;
        const tags = '1048779154738384987,' + thread.appliedTags.toString();
        thread
          .edit({
            appliedTags: tags.split(','),
          })
          .catch(err => {
            return err;
          });
      })
      .catch(err => {
        return err;
      });
  }

  if (message.guild.id !== process.env.GUILD_ID) {
    if (message.content.startsWith(`<@${client.user.id}>`)) {
      message.reply(
        'Olá, eu sou The Reaper, um bot de moderação para o Discord. Como moderador, você pode contar com minhas habilidades para garantir que o seu servidor seja um lugar seguro e agradável para todos. Eu posso ajudar a manter o ordem, filtrar conteúdos inapropriados e punir os infratores. Além disso, eu ofereço recursos avançados de gerenciamento de membros e configurações personalizáveis. Utilize minhas funções para obter acesso e comece a usufruir de minhas funcionalidades agora!',
      );
    }
  }

  if (message.guild.id === process.env.GUILD_ID) {
    if (message.member && !message.member.permissions.has('Administrator'))
      return;
    if (message.content.startsWith(`<@${client.user.id}>`)) {
      const embed = new discord.EmbedBuilder()
        .setTitle('Reaper Control - A fast and efficient control')
        .setDescription(
          'Controle a adesão de novos servidores, comandos de desenvolvimento tudo num menu de controlo rápido e eficiente!',
        )
        .setColor(client.cor);
      const row = new discord.ActionRowBuilder().addComponents(
        new discord.StringSelectMenuBuilder()
          .setCustomId('control')
          .setPlaceholder('Controle tudo imediatamente!')
          .addOptions(
            {
              label: 'Aprovar servidor',
              description: 'Aprove um novo servidor na rede',
              value: 'approve',
              emoji: '1026116735759302727',
            },
            {
              label: 'Rejeitar servidor',
              description: 'Servidor problemático na rede? Remova-o!',
              value: 'reject',
              emoji: '1026116707770712136',
            },
            {
              label: 'Faça evaluate de um código (dev only)',
              description: 'Cuidado isto pode ser perigoso!',
              value: 'eval',
              emoji: '1026116730969395311',
            },
          ),
      );
      message.reply({ embeds: [embed], components: [row] });
    }
  }
};
