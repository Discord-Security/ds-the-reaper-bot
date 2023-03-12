const discord = require('discord.js');

module.exports = async (client, member) => {
  if (member.user.bot) return 0;

  client.channels.cache.get(client.canais.serverLogs).send({
    content: `[${new Date().toLocaleString('pt-BR')}] **${
      member.user.tag
    }** saiu em **${member.guild.name}** (ID: ${member.user.id})`,
  });

  const doc = await client.db.Guilds.findOne({ _id: member.guild.id });

  if (doc) {
    if (
      doc.logs.leftMember !== '' &&
      doc.logs.leftMember !== undefined &&
      doc.logs.leftMember !== null
    ) {
      const embed = new discord.EmbedBuilder()
        .setDescription(`***${member.user.tag}* | Membro __Saiu__**`)
        .setColor(client.cor)
        .addFields({ name: 'Tag:', value: member.user.tag })
        .setFooter({ text: 'ID do Usuário: ' + member.user.id });

      client.trySend(
        doc.logs.leftMember,
        member.guild,
        { embeds: [embed] },
        'logs de saída de membros',
      );
    }
    if (
      doc.logs.punishments !== '' &&
      doc.logs.punishments !== undefined &&
      doc.logs.punishments !== null
    ) {

        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: 20,
        });
        const kickLog = fetchedLogs.entries.first();

        if (!kickLog) return 0;

        const { executor, target } = kickLog;

        if (target.id === member.id) {
          const emb = new discord.EmbedBuilder()
            .setColor(client.cor)
            .setDescription(
              `***${
                member.user.tag
              }* | Membro __Expulso__**\n\n<:Discord_Danger:1028818835148656651> **Usuário:**\nTag: \`${
                member.user.tag
              }\`\nID: \`${
                member.user.id
              }\`\n\n<:Discord_Info:1036702634603728966> **Moderador:**\nTag: \`${
                executor.tag || 'Desconhecido'
              }\`\nID: \`${
                executor.id || 'Desconhecido'
              }\`\n\n<:Discord_Chat:1035624171960541244> **Motivo:**\n\`${
                kickLog.reason || 'Sem Motivo'
              }\``,
            )
            .setColor(client.cor);
          client.channels.cache
            .get(doc.logs.punishments)
            .send({ embeds: [emb] });
          client.trySend(
            doc.logs.punishments,
            member.guild,
            { embeds: [emb] },
            'logs de punições (Kick)',
          );
        }
    }
    if (
      doc &&
      doc.exit.active === true &&
      doc.exit.channel !== undefined &&
      doc.exit.channel !== null
    ) {
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

      const replaced = await doc.exit.content
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

      client.channels.cache
        .get(doc.exit.channel)
        .send(parsed)
        .then(msg => {
          if (doc.exit.timeout === 0) return;
          setTimeout(() => {
            msg.delete();
          }, doc.exit.timeout);
        })
        .catch(err => {
          client.channels.cache.get(client.canais.strikes).send({
            content: `<@${member.guild.ownerId}>, seu servidor ${member.guild.name} falhou ao enviar mensagem de saída: ${err}`,
          });
        });
    }
  }
};
