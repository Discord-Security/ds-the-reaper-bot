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
        .setMaxLength(2)
        .setMinLength(2)
        .setRequired(true);

      const MotivoInput = new discord.TextInputBuilder()
        .setCustomId('MotivoInput')
        .setLabel('Porque você gostaria de se juntar á rede?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(512)
        .setRequired(true);

      const IDInput = new discord.TextInputBuilder()
        .setCustomId('IDInput')
        .setLabel('Qual o id do seu servidor?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(20)
        .setRequired(true);

      const FuncaoInput = new discord.TextInputBuilder()
        .setCustomId('FunçãoInput')
        .setLabel('Qual a sua função no servidor?')
        .setStyle(discord.TextInputStyle.Paragraph)
        .setMaxLength(20)
        .setRequired(true);

      modal.addComponents(
        new discord.ActionRowBuilder().addComponents(IdadeInput),
        new discord.ActionRowBuilder().addComponents(MotivoInput),
        new discord.ActionRowBuilder().addComponents(IDInput),
        new discord.ActionRowBuilder().addComponents(FuncaoInput),
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
        const idade = parseInt(i.fields.getTextInputValue('IdadeInput'));
        const id = i.fields.getTextInputValue('IDInput');
        const funcao = i.fields.getTextInputValue('FunçãoInput');

        const member = interaction.member;

        const server = client.guilds.cache.get(id);

        const approve = new discord.ButtonBuilder()
          .setCustomId(`Registrar ${member.id} ${id}`)
          .setLabel('Registrar')
          .setStyle(2)
          .setEmoji('1026116735759302727');

        const row = new discord.ActionRowBuilder().setComponents(approve);

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

        const strikes = [];

        if (!server || !server.name)
          strikes.push(
            `Não estou dentro do servidor que você mencionou, recomendo você me colocar no seu servidor para adiantar mais rápido o processo da sua aprovação.`,
          );

        if (isNaN(idade) || idade < 13)
          strikes.push(
            `Você mencionou a sua idade de forma incorreta ou a sua idade não permite você entrar no Discord e a gente não permite pessoas que descumpram a TOS.`,
          );

        if (strikes.length > 0) {
          interaction.channel.send({
            content: `${
              interaction.member
            }, alguns dos meus sistemas apontaram que você inseriu alguns campos errados ou faltam ações externas a se fazer, das quais essas:\n\n* ${strikes.join(
              '\n* ',
            )}`,
          });
        }
      }
    } else {
      const guild = await client.db.Guilds.findOne({
        _id: interaction.guild.id,
      }).lean();

      if (guild.approved === true)
        return interaction.reply({
          content: 'Este servidor já foi aprovado dentro da rede.',
          ephemeral: true,
        });

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
        const motivo = i.fields.getTextInputValue('MotivoInput');
        const idade = parseInt(i.fields.getTextInputValue('IdadeInput'));

        if (!isNaN(idade) && idade < 13)
          return i.reply({
            content:
              'Você não pode acessar nossa rede devido à idade insuficiente exigida pelo Discord, o que violaria os Termos de Serviço da plataforma.',
            ephemeral: true,
          });

        i.reply({
          content:
            'Sua candidatação foi enviada com sucesso e está em análise.',
          ephemeral: true,
        });

        const invite = await interaction.channel.createInvite({
          maxAge: 0,
          maxUses: 0,
        });

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
