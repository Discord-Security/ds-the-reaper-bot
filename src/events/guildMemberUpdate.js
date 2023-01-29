const discord = require('discord.js');

module.exports = async (client, member) => {
  if (member.user.bot) return 0;

  const doc = await client.db.Guilds.findOne({ _id: member.guild.id });

  if (
    doc &&
    doc.logs.punishments !== '' &&
    doc.logs.punishments !== undefined &&
    doc.logs.punishments !== null
  ) {
    try {
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 24
      });
      const timeoutLog = fetchedLogs.entries.first();

      if (!timeoutLog) return 0;

      const { executor, target } = timeoutLog;

      if (
        target.id === member.user.id &&
        timeoutLog.changes[0].key === 'communication_disabled_until' &&
        timeoutLog.changes[0].old === undefined
      ) {
        const emb = new discord.EmbedBuilder()
          .setColor(client.cor)
          .setDescription(
            `***${
              member.user.tag
            }* | Membro __Castigado__**\n\n<:Discord_Danger:1028818835148656651> **Usuário:**\nTag: \`${
              member.user.tag
            }\`\nID: \`${member.user.id}\`\nTempo: ${discord.time(
              new Date(timeoutLog.changes[0].new),
              'R'
            )}\n\n<:Discord_Info:1036702634603728966> **Moderador:**\nTag: \`${
              executor.tag || 'Desconhecido'
            }\`\nID: \`${
              executor.id || 'Desconhecido'
            }\`\n\n<:Discord_Chat:1035624171960541244> **Motivo:**\n\`${
              timeoutLog.reason || 'Sem Motivo'
            }\``
          )
          .setColor(client.cor);
        client.channels.cache.get(doc.logs.punishments).send({ embeds: [emb] });
      }
    } catch (err) {
      client.channels.cache.get(client.canais.strikes).send({
        content: `<@${member.guild.ownerId}>, seu servidor ${member.guild.name} falhou ao enviar mensagem do log de punições: ${err}`
      });
    }
  }
};
