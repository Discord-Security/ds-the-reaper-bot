module.exports = async (client, interaction) => {
  const argumentos = interaction.customId.split(' ');

  interaction.reply({ content: 'Feito!' });

  client.db.Staffs.findOne({ _id: argumentos[1] }, function (err, staff) {
    if (err) return interaction.reply(err);
    if (staff) {
      staff.serverIds.push(argumentos[2]);
      staff.save();
    } else {
      new client.db.Staffs({
        _id: argumentos[1],
        serverIds: [argumentos[2]],
      }).save();
    }
    client.db.Guilds.findOne({ _id: argumentos[2] }, function (err, guild) {
      if (err) return interaction.reply(err);
      const member = interaction.guild.members.cache.get(argumentos[1]);
      member.roles.add('1025774982980186186');
      member.roles.remove('1055623367937507438');
      if (guild && guild.roleId && guild.roleId !== '') {
        member.roles.add(guild.roleId);
      } else {
        const server = client.guilds.cache.get(argumentos[2]);
        interaction.guild.roles
          .create({
            name: server ? server.name : 'Reaper não detectou?',
            color: '#5d83b3',
            reason: 'Novo cargo para registro do utilizador',
          })
          .then(role => {
            member.roles.add(role);
            if (guild) {
              guild.roleId = role.id;
              guild.save();
            }
            if (!guild)
              new client.db.Guilds({
                _id: argumentos[2],
                roleId: role.id,
              }).save();
          });
      }
    });
  });
};