const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('massban')
    .setNameLocalizations({
      'pt-BR': 'banir_em_massa',
      'en-US': 'massban',
    })
    .setDescription('Realize múltiplos banimentos em network')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName('ids')
        .setDescription(
          "Liste os ID's separando-os com espaços e não vírgulas.",
        )
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('gravidade')
        .setNameLocalizations({
          'pt-BR': 'gravidade',
          'en-US': 'severity',
        })
        .setDescription('Identifique a gravidade de 1 a 2')
        .setMaxValue(2)
        .setMinValue(1)
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('senha')
        .setNameLocalizations({
          'pt-BR': 'senha',
          'en-US': 'password',
        })
        .setDescription('Identifique a senha para banimentos em massa')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({ 'pt-BR': 'motivo', 'en-US': 'reason' })
        .setDescription('Identifique um motivo.')
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = require('../../reasons.json');
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue.toLowerCase()),
    );
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    );
  },
  async execute(interaction, client) {
    const gravidade = interaction.options.getInteger('gravidade');
    const usuario = interaction.options.getString('ids').split(' ');
    const senha = interaction.options.getString('senha');
    const motivo =
      interaction.options.getString('motivo') ?? 'Sem motivo informado.';
    if (senha !== process.env.senha)
      return interaction.reply({ content: 'A senha está errada.' });
    const reason = `Banido com The Reaper, por ${interaction.member.user.tag} foi definido como gravidade ${gravidade} - ${motivo}`;
    await interaction.deferReply({ ephemeral: true });
    if (gravidade === 1) {
      const guild = client.guilds.cache.get(interaction.guild.id);
      usuario.forEach(banido =>
        guild.bans.create(banido, {
          reason,
          deleteMessageSeconds: 1 * 24 * 60 * 60,
        }),
      );
      interaction.editReply({
        content: 'Banido com sucesso apenas neste servidor.',
      });
    }
    if (gravidade >= 2) {
      client.guilds.cache.forEach(a => {
        usuario.forEach(banido =>
          a.bans
            .create(banido, { reason, deleteMessageSeconds: 1 * 24 * 60 * 60 })
            .catch(err => {
              return err;
            }),
        );
      });
      interaction.editReply({
        content: `Banido com sucesso em ${client.guilds.cache.size} servidores.`,
      });
    }
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Banimento em massa - ' + interaction.guild.name)
      .addFields(
        {
          name: '<:Discord_Star:1038602481640407050> Moderador',
          value: `${interaction.member.user.tag} (${interaction.member.id})`,
          inline: true,
        },
        {
          name: '<:Discord_Online:1035624222338334770> Gravidade',
          value: gravidade.toString(),
          inline: true,
        },
        {
          name: '<:Discord_Chat:1035624171960541244> Motivo',
          value: `\`${motivo}\``,
        },
      )
      .setImage('https://i.imgur.com/LdwPnzp.png')
      .setThumbnail(interaction.guild.iconURL());
    const list = new discord.AttachmentBuilder(Buffer.from(usuario.join(' ')), {
      name: 'reus.txt',
    });
    client.channels.cache.get(client.canais.logs).send({
      embeds: [embed],
      files: [list],
    });
  },
};
