const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('oldMembers')
    .setNameLocalizations({
      'pt-BR': 'membros_antigos',
      'en-US': 'oldMembers',
    })
    .setDescription('Veja os membros mais antigos do servidor.'),
  async execute(interaction, client) {
    interaction.reply({ content: 'Pesquisando contéudo...', ephemeral: true });
    const members = interaction.guild.members.cache
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .array();
    const pages = members.chunk(15);

    let currentPage = 1;
    const totalPages = pages.length;

    // Cria a função para gerar a mensagem de página
    const generatePage = page => {
      const embed = new discord.EmbedBuilder()
        .setTitle(`Lista de membros ${interaction.guild.name}`)
        .setDescription(`Página ${currentPage}/${totalPages}`)
        .setColor(client.cor);

      embed.addField('Membros', page.map(member => member.user.tag).join('\n'));

      return embed;
    };
    const str2 = Math.floor(Math.random() * 100);
    const antes = new discord.ButtonBuilder()
      .setCustomId(str2 + 'prev')
      .setEmoji('1065370746303553587')
      .setStyle(2)
      .setDisabled(currentPage === 1);
    const depois = new discord.ButtonBuilder()
      .setCustomId(str2 + 'next')
      .setEmoji('1065370743526916096')
      .setStyle(2)
      .setDisabled(currentPage < totalPages);
    const botao = new discord.ActionRowBuilder()
      .addComponents(antes)
      .addComponents(depois);
    const mensagem = await interaction.editReply({
      embeds: [generatePage(pages[currentPage])],
      components: [botao],
    });

    const filter = interaction =>
      interaction.customId === str2 + 'next' ||
      interaction.customId === str2 + 'prev';

    const collector = mensagem.createMessageComponentCollector({
      filter,
      time: 3600000,
    });

    collector.on('collect', i => {
      if (i.user.id === interaction.member.id) {
        if (i.customId === str2 + 'next') {
          i.deferUpdate();
          currentPage--;
          interaction.editReply({
            embeds: [generatePage(pages[currentPage])],
            components: [botao],
          });
        }
        if (i.customId === str2 + 'prev') {
          i.deferUpdate();
          currentPage++;
          interaction.editReply({
            embeds: [generatePage(pages[currentPage])],
            components: [botao],
          });
        }
      } else {
        i.reply({ content: client.msg.content.invalid, ephemeral: true });
      }
    });
  },
};
