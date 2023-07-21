const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('parcerias')
    .setNameLocalizations({
      'pt-BR': 'parcerias',
      'en-US': 'patners',
    })
    .setDescription('Configure suas parcerias!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal')
        .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
        .setDescription('Defina um canal')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cargo')
        .setNameLocalizations({ 'pt-BR': 'cargo', 'en-US': 'role' })
        .setDescription('Defina um cargo')
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setNameLocalizations({ 'pt-BR': 'cargo', 'en-US': 'role' })
            .setDescription('Identifique o cargo')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mensagem')
        .setNameLocalizations({ 'pt-BR': 'mensagem', 'en-US': 'message' })
        .setDescription('Defina uma mensagem'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setNameLocalizations({ 'pt-BR': 'informação', 'en-US': 'info' })
        .setDescription('Deixe-lhe explicar como este sistema funciona.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    if (subcommand === 'mensagem') {
      const modal = new discord.ModalBuilder()
        .setCustomId('mensagem')
        .setTitle('Conteúdo da parceria');

      const MessageInput = new discord.TextInputBuilder()
        .setCustomId('MessageInput')
        .setLabel('Coloque a sua mensagem de parceria')
        .setStyle(discord.TextInputStyle.Paragraph);

      const firstActionRow = new discord.ActionRowBuilder().addComponents(
        MessageInput,
      );

      modal.addComponents(firstActionRow);

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
        const doc = await client.db.Guilds.findOne({
          _id: interaction.guild.id,
        });
        if (doc) {
          doc.partner.message = i.fields.getTextInputValue('MessageInput');
          doc.save();
        } else {
          new client.db.Guilds({
            _id: interaction.guild.id,
            partner: {
              message: i.fields.getTextInputValue('MessageInput'),
            },
          }).save();
        }
        i.reply({ content: 'Definido mensagem com sucesso.' });
      }
    }
    if (subcommand === 'cargo') {
      const role = interaction.options.getRole('cargo');
      interaction.reply('Definido com sucesso para esse cargo.');
      const doc = await client.db.Guilds.findOne({ _id: interaction.guild.id });
      if (doc) {
        doc.partner.role = role.id;
        return doc.save();
      }
      return new client.db.Guilds({
        _id: interaction.guild.id,
        partner: { role: role.id },
      }).save();
    }
    if (subcommand === 'canal') {
      const channel = interaction.options.getChannel('canal');
      interaction.reply('Definido com sucesso para esse canal.');
      const doc = await client.db.Guilds.findOne({ _id: interaction.guild.id });
      if (doc) {
        doc.partner.channel = channel.id;
        doc.partneractivated = true;
        return doc.save();
      }
      return new client.db.Guilds({
        _id: interaction.guild.id,
        partneractivated: true,
        partner: { channel: channel.id },
      }).save();
    }
    if (subcommand === 'info') {
      const emb = new discord.EmbedBuilder()
        .setTitle('Reaper Partners - Como funciona?')
        .setColor(client.cor)
        .setDescription(
          'Este é um sistema muito simples, as parcerias decorrem de 7 em 7 dias (segunda-feira ás 13h), mas antes você deverá definir o seu canal de parcerias, o seu cargo de notificar parcerias e ainda a sua mensagem de parcerias, nada mais do que isso.',
        );
      interaction.reply({ embeds: [emb] });
    }
  },
};
