const discord = require('discord.js');
const superagent = require('superagent');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('userinfo')
    .setNameLocalizations({
      'pt-BR': 'info_usuário',
      'en-US': 'userinfo',
    })
    .setDescription('Veja várias informações úteis do usuário!')
    .addUserOption(option =>
      option
        .setName('usuário')
        .setNameLocalizations({ 'pt-BR': 'usuário', 'en-US': 'user' })
        .setDescription('Identifique o utilizador')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const membro = interaction.options.getMember('usuário');
    if (!membro) {
      return interaction.reply({
        content: 'Sup! Não foi encontrado um usuário dentro deste servidor.',
      });
    }

    const doc = await client.db.Users.findOne({ _id: membro.id });

    const info = new discord.ButtonBuilder()
      .setCustomId('info')
      .setLabel('Informação')
      .setEmoji('1036702634603728966')
      .setStyle(2);
    const guilds = new discord.ButtonBuilder()
      .setCustomId('guilds')
      .setLabel('Servidores mútuos')
      .setEmoji('1028818928383836311')
      .setStyle(2);
    const roles = new discord.ButtonBuilder()
      .setCustomId('roles')
      .setLabel('Cargos')
      .setEmoji('1041100114762149958')
      .setStyle(2);
    const row = new discord.ActionRowBuilder().addComponents(
      info,
      guilds,
      roles,
    );

    const embed = new discord.EmbedBuilder()
      .setTitle(membro.user.tag)
      .addFields(
        {
          name: '<:Discord_ID:1028818985942253578> ID:',
          value: membro.user.id,
          inline: true,
        },
        {
          name: '<:Discord_Join:1041100297629597836> Criada em: ',
          value: `${discord.time(membro.user.createdAt, 'f')} (${discord.time(
            membro.user.createdAt,
            'R',
          )})`,
          inline: true,
        },
        {
          name: '<:exit:1039949967772622948> Entrou em: ',
          value: membro.joinedTimestamp
            ? `${discord.time(
                Math.floor(membro.joinedTimestamp / 1000),
                'f',
              )} (${discord.time(
                Math.floor(membro.joinedTimestamp / 1000),
                'R',
              )})`
            : 'Não está dentro do servidor.',
          inline: true,
        },
        {
          name: '<:Discord_Danger:1028818835148656651> Histórico de avisos:',
          value:
            doc && doc.warns
              ? `\`\`\`${doc.warns.join('\n')}\`\`\``
              : 'Sem avisos',
        },
      )
      .setColor(client.cor)
      .setThumbnail(membro.user.displayAvatarURL({ extension: 'png' }));
    const mensagem = await interaction.reply({
      embeds: [embed],
      components: [row],
    });
    const filter = i => interaction.user.id === i.user.id;
    const collector = mensagem.createMessageComponentCollector({
      componentType: discord.ComponentType.Button,
      filter,
      time: 300000,
    });

    collector.on('collect', async i => {
      i.deferUpdate();
      if (i.customId === 'info') interaction.editReply({ embeds: [embed] });

      if (i.customId === 'guilds') {
        const { body } = await superagent
          .get(
            `https://floppapower.perfectdreams.net/api/v1/users/${membro.user.id}/guilds`,
          )
          .catch(err => {
            if (err) return [];
          });
        const guildsemb = new discord.EmbedBuilder()
          .setColor(client.cor)
          .setThumbnail(membro.user.displayAvatarURL({ extension: 'png' }))
          .setTitle(membro.user.tag)
          .setDescription(
            `Servidores da Rede The Reaper mútuos:\n\n${client.guilds.cache
              .filter(guild => {
                return guild.members.cache.has(membro.user.id);
              })
              .map(
                g =>
                  '```✙ ' +
                  g.name
                    .replace(
                      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|)/g,
                      '',
                    )
                    .replace('  ', ' ') +
                  '```',
              )
              .join('')}\n\nOutros servidores por aí:\n\n${
              body
                ? body
                    .map(
                      g =>
                        '```✙ ' +
                        g.name
                          .replace(
                            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|)/g,
                            '',
                          )
                          .replace('  ', ' ') +
                        '```',
                    )
                    .join('')
                : 'Sem servidores.'
            }`,
          );
        interaction.editReply({ embeds: [guildsemb] });
      }
      if (i.customId === 'roles') {
        const guildsemb = new discord.EmbedBuilder()
          .setColor(client.cor)
          .setThumbnail(membro.user.displayAvatarURL({ extension: 'png' }))
          .setTitle(membro.user.tag)
          .setDescription(
            `${
              membro._roles.map(role => '<@&' + role + '>').join(', ') ||
              'Sem cargos.'
            }`,
          );
        interaction.editReply({ embeds: [guildsemb] });
      }
    });
  },
};
