const discord = require('discord.js');

module.exports = async (client, member) => {
  if (member.user.bot) return 0;

  client.channels.cache.get(client.canais.serverLogs).send({
    content: `[${new Date().toLocaleString('pt-BR')}] **${
      member.user.tag
    }** entrou em **${member.guild.name}** (ID: ${member.user.id})`,
  });

  const doc = await client.db.Guilds.findOne({ _id: member.guild.id });

  if (doc) {
    // Logs de entrada de membros

    if (
      doc.logs.joinedMember !== '' &&
      doc.logs.joinedMember !== undefined &&
      doc.logs.joinedMember !== null
    ) {
      const embed = new discord.EmbedBuilder()
        .setDescription(`***${member.user.tag}* | Membro __Entrou__**`)
        .setColor(client.cor)
        .addFields(
          { name: 'Tag:', value: member.user.tag },
          {
            name: 'Data de Criação:',
            value: discord.time(member.user.createdAt, 'f') || 'Unknown',
          },
        )
        .setImage('https://i.imgur.com/VM2deMh.png')
        .setFooter({ text: 'ID do Usuário: ' + member.user.id });
      client.trySend(
        doc.logs.joinedMember,
        member.guild,
        { embeds: [embed] },
        'logs de entrada de membros',
      );
    }

    // Anti fake

    if (doc.antifake.active !== false) {
      if (
        parseInt(Date.now() - member.user.createdAt) <
        parseInt(doc.antifake.time)
      ) {
        doc.antifake.action === 'Kick'
          ? member.kick('O usuário têm uma conta nova, expulso pelo anti-fake.')
          : member.ban({
              reason: 'O usuário têm uma conta nova, banido pelo anti-fake.',
            });

        if (doc.antifake.channel !== '') {
          const emb = new discord.EmbedBuilder()
            .setAuthor({
              name: 'Novo usuário detectado no Anti-Fake!',
              iconURL: 'https://i.imgur.com/0MqlDVt.png',
            })
            .setColor(client.cor)
            .addFields([
              { name: 'ID', value: member.user.id },
              {
                name: 'Data de Criação',
                value: discord.time(member.user.createdAt, 'f') || 'Unknown',
              },
              { name: 'Ação Tomada', value: doc.antifake.action },
            ]);
          client.trySend(
            doc.antifake.channel,
            member.guild,
            { embeds: [emb] },
            'mensagem do anti-fake',
          );
        }
        return 0;
      }
    }

    // Mensagem de Boas-vindas customizável
    if (doc.welcome.active === true) {
      if (doc.welcome.roles.length > 0) {
        doc.welcome.roles.forEach(function (cargo) {
          member.roles.add(cargo).catch(err => {
            if (err)
              client.channels.cache.get(client.canais.strikes).send({
                content: `<@${member.guild.ownerId}>, seu servidor ${member.guild.name} falhou ao oferecer cargo de autorole: ${err}`,
              });
          });
        });
      }

      if (doc.welcome.channel !== undefined && doc.welcome.channel !== null) {
        // Variáveis

        const contadorMembros = member.guild.memberCount;
        const contadorRegistro = discord.time(member.user.createdAt, 'f');
        const id = member.user.id;
        const nome = member.user.username;
        const tag = member.user.tag;
        const avatar = await member.user.displayAvatarURL({
          extension: 'png',
          dynamic: true,
        });
        const membro = `<@${member.user.id}>`;
        const serverNome = member.guild.name;
        const serverId = member.guild.id;
        const serverIcon = await member.guild.iconURL({
          extension: 'png',
          dynamic: true,
        });

        const replaced = await doc.welcome.content
          .replace('"%avatar"', `"${avatar}"`)
          .replace('%contadorMembros', contadorMembros)
          .replace('%contadorRegistro', contadorRegistro)
          .replace('%id', id)
          .replace('%nome', nome)
          .replace('%tag', tag)
          .replace('%membro', membro)
          .replace('%serverNome', serverNome)
          .replace('%serverId', serverId)
          .replace('"%serverIcon"', `"${serverIcon}"`);

        const parsed = JSON.parse(replaced);

        client.trySend(
          doc.welcome.channel,
          member.guild,
          parsed,
          'mensagem do bem-vindo',
        );
      }
    }
  }
  if (!doc) new client.db.Guilds({ _id: member.guild.id }).save();
};
