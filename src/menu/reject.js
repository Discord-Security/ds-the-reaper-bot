module.exports = async (client, interaction) => {
  if (!interaction.member.permissions.has('Administrator')) return;
  interaction.deferUpdate();
  interaction.channel.send({
    content: 'Diga o ID do Servidor.',
  });
  const filter = m => interaction.user.id === m.author.id;
  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 300000,
    max: 1,
  });

  collector.on('collect', async message => {
    const id = message.content;
    const guild = client.guilds.cache.get(id);
    guild ? guild.leave() : await client.db.Guilds.deleteOne({ _id: id });
    message.reply({ content: 'Servidor rejeitado com sucesso!' });
  });
};
