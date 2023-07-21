const discord = require('discord.js');

module.exports = async (client, member) => {
  if (member.user.bot) return 0;

  const doc = await client.db.Guilds.findOne({ _id: member.guild.id });

  if (
    doc.logs.punishments !== '' &&
    doc.logs.punishments !== undefined &&
    doc.logs.punishments !== null
  ) {
    try {
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 23,
      });
      const unbanLog = fetchedLogs.entries.first();

      if (!unbanLog) return 0;

      const { executor, target } = unbanLog;

      if (target.id === member.user.id) {
        const emb = new discord.EmbedBuilder()
          .setColor(client.cor)
          .setDescription(
            `***${
              member.user.tag
            }* | Membro __Desbanido__**\n\n<:Discord_Danger:1028818835148656651> **Usuário:**\nTag: \`${
              member.user.tag
            }\`\nID: \`${
              member.user.id
            }\`\n\n<:Discord_Info:1036702634603728966> **Moderador:**\nTag: \`${
              executor.tag || 'Desconhecido'
            }\`\nID: \`${executor.id || 'Desconhecido'}\``,
          )
          .setColor(client.cor);
        client.channels.cache.get(doc.logs.punishments).send({ embeds: [emb] });
      }
    } catch (err) {
      client.channels.cache.get(client.canais.strikes).send({
        content: `<@${member.guild.ownerId}>, seu servidor ${member.guild.name} falhou ao enviar mensagem do log de punições: ${err}`,
      });
    }
  }
};
