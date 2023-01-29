const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('candidatar')
    .setNameLocalizations({
      'pt-BR': 'candidatar',
      'en-US': 'apply',
    })
    .setDescription('Candidate o seu servidor á rede.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {
    if (interaction.guild.id === '1025774982980186183') {
      const modal = new discord.ModalBuilder()
        .setCustomId('candidatar')
        .setTitle('Formulário de candidatação');

      const IdadeInput = new discord.TextInputBuilder()
        .setCustomId('IdadeInput')
        .setLabel('Qual sua idade?')
        .setStyle(discord.TextInputStyle.Short)
        .setRequired(true);

      const firstActionRow = new discord.ActionRowBuilder().addComponents(
        IdadeInput,
      );

      const MotivoInput = new discord.TextInputBuilder()
        .setCustomId('MotivoInput')
        .setLabel('Porque você gostaria de se juntar á rede?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(512)
        .setRequired(true);

      const secondActionRow = new discord.ActionRowBuilder().addComponents(
        MotivoInput,
      );

      const IDInput = new discord.TextInputBuilder()
        .setCustomId('IDInput')
        .setLabel('Qual o id do seu servidor?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(20)
        .setRequired(true);

      const thirdActionRow = new discord.ActionRowBuilder().addComponents(
        IDInput,
      );

      const FuncaoInput = new discord.TextInputBuilder()
        .setCustomId('FunçãoInput')
        .setLabel('Qual a sua função no servidor?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(20)
        .setRequired(true);

      const fourActionRow = new discord.ActionRowBuilder().addComponents(
        FuncaoInput,
      );

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourActionRow,
      );

      await interaction.showModal(modal);

      const i = await interaction
        .awaitModalSubmit({
          time: 300000,
          filter: i => i.user.id === interaction.user.id,
        })
        .catch(error => {
          if (error) return null;
        });

      if (i) {
        i.reply({
          content:
            'Sua candidatação foi enviada com sucesso e está em análise.',
          ephemeral: true,
        });
        const motivo = i.fields.getTextInputValue('MotivoInput');
        const idade = i.fields.getTextInputValue('IdadeInput');
        const id = i.fields.getTextInputValue('IDInput');
        const funcao = i.fields.getTextInputValue('FunçãoInput');
        const member = interaction.member;
        const approve = new discord.ButtonBuilder()
          .setCustomId(`Registrar ${member.id} ${id}`)
          .setLabel('Registrar')
          .setStyle(2)
          .setEmoji('1026116735759302727');
        const row = new discord.ActionRowBuilder().setComponents(approve);
        const server = client.guilds.cache.get(id);
        const embed = new discord.EmbedBuilder()
          .setTitle(member.user.tag)
          .addFields([
            {
              name: '👑 Solicitador:',
              value: `ID: ${member.id}\nTag: ${member.user.tag}\nIdade: ${idade}\nMotivo: ${motivo}\nFunção: ${funcao}`,
            },
            {
              name: '📜 Servidor:',
              value: `ID: ${id.toString()} Servidor: ${
                server ? server.name : 'Desconhecido ou Fora de rede'
              }`,
            },
          ])
          .setThumbnail(member.displayAvatarURL({ dynamic: true }))
          .setColor(client.cor);

        client.channels.cache
          .get('1055621062836105236')
          .send({ embeds: [embed], components: [row] });
      }
    } else {
      await client.db.Guilds.findOne(
        { _id: interaction.guild.id },
        function (err, guild) {
          if (err) interaction.channel.send(err);
          if (guild) {
            if (guild.approved === true)
              return interaction.reply({
                content: 'Este servidor já foi aprovado dentro da rede.',
                ephemeral: true,
              });
          } else if (!guild)
            new client.db.Guilds({ _id: interaction.guild.id }).save();
        },
      );

      const modal = new discord.ModalBuilder()
        .setCustomId('candidatar')
        .setTitle('Formulário de candidatação');

      const IdadeInput = new discord.TextInputBuilder()
        .setCustomId('IdadeInput')
        .setLabel('Qual sua idade?')
        .setStyle(discord.TextInputStyle.Short)
        .setRequired(true);

      const firstActionRow = new discord.ActionRowBuilder().addComponents(
        IdadeInput,
      );

      const MotivoInput = new discord.TextInputBuilder()
        .setCustomId('MotivoInput')
        .setLabel('Porque você gostaria de se juntar á rede?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(512)
        .setRequired(true);

      const secondActionRow = new discord.ActionRowBuilder().addComponents(
        MotivoInput,
      );

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);

      const i = await interaction
        .awaitModalSubmit({
          time: 300000,
          filter: i => i.user.id === interaction.user.id,
        })
        .catch(error => {
          if (error) return null;
        });

      if (i) {
        i.reply({
          content:
            'Sua candidatação foi enviada com sucesso e está em análise.',
          ephemeral: true,
        });
        const invite = await interaction.channel.createInvite({
          maxAge: 0,
          maxUses: 0,
        });
        const motivo = i.fields.getTextInputValue('MotivoInput');
        const idade = i.fields.getTextInputValue('IdadeInput');
        const guild = interaction.guild;
        const member = interaction.member;
        const approve = new discord.ButtonBuilder()
          .setCustomId('approve-' + guild.id)
          .setLabel('Aprovar')
          .setStyle(2)
          .setEmoji('1026116735759302727');
        const reject = new discord.ButtonBuilder()
          .setCustomId('reject-' + guild.id)
          .setLabel('Rejeitar')
          .setStyle(2)
          .setEmoji('1026116707770712136');
        const row = new discord.ActionRowBuilder().setComponents(
          approve,
          reject,
        );
        const embed = new discord.EmbedBuilder()
          .setTitle(guild.name)
          .addFields([
            {
              name: '👑 Solicitador:',
              value: `ID: ${member.id}\nTag: ${member.user.tag}\nIdade: ${idade}\nMotivo: ${motivo}`,
            },
            {
              name: '📜 Servidor:',
              value: `ID: ${guild.id.toString()}\nDono: ${
                guild.ownerId
              }\nMembros: ${guild.memberCount}`,
            },
            {
              name: '📨 Convite:',
              value: invite.url,
            },
          ])
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setColor(client.cor);

        client.channels.cache
          .get('1050494003155570708')
          .send({ content: '@everyone', embeds: [embed], components: [row] });
      }
    }
  },
};
