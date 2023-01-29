module.exports = (client, interaction) => {
  const id = interaction.customId.replace('reject-', '');
  interaction.reply({
    content: `Prontinho, Servidor ${id} rejeitado com sucesso!`,
  });
  const guild = client.guilds.cache.get(id);
  guild ? guild.leave() : client.db.Guilds.deleteOne({ _id: id });
};
