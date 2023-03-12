module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('approve'))
      return require('../button/approve')(client, interaction);
    if (interaction.customId.startsWith('reject'))
      return require('../button/reject')(client, interaction);
    if (interaction.customId.startsWith('Registrar'))
      return require('../button/registrar')(client, interaction);
    else if (
      interaction.customId !== 'info' &&
      interaction.customId !== 'guilds' &&
      interaction.customId !== 'roles'
    )
      require('../button/' + interaction.customId)(client, interaction);
  }
  if (interaction.isStringSelectMenu()) {
    require('../menu/' + interaction.values[0])(client, interaction);
  }
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    command.autocomplete(interaction);
  }
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      const guild = await client.db.Guilds.findOne({
        _id: interaction.guild.id,
      }).lean();
      if (!guild) {
        new client.db.Guilds({ _id: interaction.guild.id }).save();
        return interaction.reply(
          'Este servidor está sendo cadastrado em nosso banco de dados, tente novamente.',
        );
      }
      if (
        guild.approved === false &&
        interaction.commandName !== 'candidatar'
      ) {
        return interaction.reply(
          'Este servidor não foi aprovado pela nossa rede ainda e por agora têm um pacote de Proteção Básica - isto é, você não tem acesso a comandos nenhuns porém eu banirei pessoas de outros servidores no seu!\n\n<:stats:1026116738145853470> Mas você gostaria de seu servidor ter acesso ás incríveis funções de toda a rede com o pacote Proteção Avançada?\nUtilize o comando `/candidatar` para tentar entrar dentro da rede.',
        );
      }
      client.channels.cache
        .get('1063903328674779206')
        .send({
          content: `[${new Date().toLocaleString('pt-BR')}] **${
            interaction.member.user.tag
          }** em **${interaction.guild.name}** usou **${
            interaction.commandName
          } ${interaction.options._hoistedOptions
            .map(option => {
              return `${option.name}: ${option.value}`;
            })
            .join(' ')}** (ID: ${interaction.member.id})`,
        })
        .catch(err => {
          if (err) return 0;
        });
      command.execute(interaction, client);
    } catch (err) {
      if (err) console.error(err);
      interaction.reply({
        content: 'Um erro foi executado no meu grande algoritmo.',
        ephemeral: true,
      });
    }
  }
};
