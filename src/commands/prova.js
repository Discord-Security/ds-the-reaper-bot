const discord = require('discord.js');
const ImgurUpload = require('img-url-to-imgur');
const uploader = new ImgurUpload(process.env.IMGUR);

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('prova')
    .setNameLocalizations({
      'pt-BR': 'prova',
      'en-US': 'proof',
    })
    .setDescription(
      'Envie provas para o servidor principal do The Reaper e sub-servidores.',
    )
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.KickMembers)
    .addStringOption(option =>
      option
        .setName('ids')
        .setDescription("Coloque todos os ID's dos responsáveis pelo ato")
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('motivo')
        .setNameLocalizations({
          'pt-BR': 'motivo',
          'en-US': 'reason',
        })
        .setDescription('Identifique as regras quebradas')
        .setRequired(true),
    )
    .addAttachmentOption(option =>
      option
        .setName('imagem')
        .setNameLocalizations({
          'pt-BR': 'imagem',
          'en-US': 'image',
        })
        .setDescription('Envie uma imagem do acontecimento.')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const ids = interaction.options.getString('ids');
    const motivo = interaction.options.getString('motivo');
    const imagem = interaction.options.getAttachment('imagem');

    interaction.reply({
      content:
        'Prova a ser processada para a host de imagem... em alguns instantes será enviado com sucesso.',
      ephemeral: true,
    });

    const img = await uploader.upload(imagem.proxyURL);
    const embed = new discord.EmbedBuilder()
      .setColor(client.cor)
      .setTitle('Caso Reaper #' + (Math.random() + 1).toString(36).substring(7))
      .addFields(
        {
          name: "<:Discord_ID:1028818985942253578> ID's:",
          value: `> ${ids}`,
          inline: true,
        },
        {
          name: '<:Discord_Staff:1028818928383836311> Staff',
          value: `> Tag: ${interaction.user.tag}\n> ID: ${interaction.user.id}`,
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Motivo',
          value: `\`${motivo}\``,
          inline: false,
        },
      )
      .setImage(img)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({
          dynamic: true,
          format: 'jpeg',
          size: 128,
        }),
      });

    client.channels.cache.get('1028714676978208939').send({ embeds: [embed] });
  },
};
