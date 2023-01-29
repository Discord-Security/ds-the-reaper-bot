const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('logs')
    .setNameLocalizations({
      'pt-BR': 'registros',
      'en-US': 'logs'
    })
    .setDescription('Defina os seus logs')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('tipo')
        .setNameLocalizations({
          'pt-BR': 'tipo',
          'en-US': 'type'
        })
        .setDescription('Qual tipo de registro você gostaria?')
        .setChoices(
          {
            name: 'Mensagem Apagada',
            value: 'apagado'
          },
          {
            name: 'Mensagem Editada',
            value: 'editado'
          },
          {
            name: 'Entrada de Membro',
            value: 'entrada'
          },
          {
            name: 'Saída de Membro',
            value: 'saida'
          },
          { name: 'Punições Reaper', value: 'Punições Reaper' }
        )
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('canal')
        .setNameLocalizations({
          'pt-BR': 'canal',
          'en-US': 'channel'
        })
        .setDescription('Qual canal?')
        .addChannelTypes(discord.ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('ativado')
        .setNameLocalizations({
          'pt-BR': 'ativado',
          'en-US': 'activated'
        })
        .setDescription('Manter log ativado ou desligado')
        .setRequired(true)
    ),
  async execute (interaction, client) {
    const tipo = interaction.options.getString('tipo');
    const canal = interaction.options.getChannel('canal');
    const ativado = interaction.options.getBoolean('ativado');
    const message = `Log ${
      ativado === true ? 'ativado' : 'desativado'
    } com sucesso.`;

    await client.db.Guilds.findOne(
      { _id: interaction.guild.id },
      function (err, doc) {
        if (err) return;
        switch (tipo) {
          case 'apagado':
            if (doc) {
              doc.logs.deletedMessage = ativado === true ? canal.id : '';
              doc.save();
            } else if (!doc) {
              new client.db.Guilds({
                _id: interaction.guild.id,
                logs: { deletedMessage: ativado === true ? canal.id : '' }
              }).save();
            }
            interaction.reply({ content: message });
            break;
          case 'editado':
            if (doc) {
              doc.logs.editedMessage = ativado === true ? canal.id : '';
              doc.save();
            } else if (!doc) {
              new client.db.Guilds({
                _id: interaction.guild.id,
                logs: { editedMessage: ativado === true ? canal.id : '' }
              }).save();
            }
            interaction.reply({ content: message });
            break;
          case 'entrada':
            if (doc) {
              doc.logs.joinedMember = ativado === true ? canal.id : '';
              doc.save();
            } else if (!doc) {
              new client.db.Guilds({
                _id: interaction.guild.id,
                logs: { joinedMember: ativado === true ? canal.id : '' }
              }).save();
            }
            interaction.reply({ content: message });
            break;
          case 'saida':
            if (doc) {
              doc.logs.leftMember = ativado === true ? canal.id : '';
              doc.save();
            } else if (!doc) {
              new client.db.Guilds({
                _id: interaction.guild.id,
                logs: { leftMember: ativado === true ? canal.id : '' }
              }).save();
            }
            interaction.reply({ content: message });
            break;
          case 'Punições Reaper':
            if (doc) {
              doc.logs.punishments = ativado === true ? canal.id : '';
              doc.save();
            } else if (!doc) {
              new client.db.Guilds({
                _id: interaction.guild.id,
                logs: { punishments: ativado === true ? canal.id : '' }
              }).save();
            }
            interaction.reply({ content: message });
            break;
        }
      }
    );
  }
};