const discord = require('discord.js');

module.exports = async (client, message) => {
  if (message.guild === null) return;
  if (
    message.channel.id === '1025774983873564689' ||
    message.channel.id === '1025774983873564688' ||
    message.channel.id === '1025780160437432330' ||
    message.channel.id === '1028714676978208939'
  ) {
    message.crosspost();
  }

  if (message.guild.id === '1025774982980186183') {
    client.channels.cache
      .get('1037138353369382993')
      .threads.fetch(message.channel.id)
      .then(thread => {
        if (thread.messageCount > 1) return;
        const tags = '1048779154738384987,' + thread.appliedTags.toString();
        thread
          .edit({
            appliedTags: tags.split(','),
          })
          .catch(err => {
            return err;
          });
      })
      .catch(err => {
        return err;
      });
  }

  if (message.guild.id !== process.env.GUILD_ID) {
    if (message.content.startsWith(`<@${client.user.id}>`)) {
      message.reply(
        'Olá, eu sou The Reaper, um bot de moderação para o Discord. Como moderador, você pode contar com minhas habilidades para garantir que o seu servidor seja um lugar seguro e agradável para todos. Eu posso ajudar a manter o ordem, filtrar conteúdos inapropriados e punir os infratores. Além disso, eu ofereço recursos avançados de gerenciamento de membros e configurações personalizáveis. Utilize minhas funções para obter acesso e comece a usufruir de minhas funcionalidades agora!',
      );
    }
  }

  if (message.guild.id === process.env.GUILD_ID) {
    if (!message.member && message.member.permissions.has('Administrator')) return;
    if (message.content.startsWith(`<@${client.user.id}>`)) {
      const embed = new discord.EmbedBuilder()
        .setTitle('Reaper Control - A fast and efficient control')
        .setDescription(
          'Controle a adesão de novos servidores, comandos de desenvolvimento tudo num menu de controlo rápido e eficiente!',
        )
        .setColor(client.cor);
      const row = new discord.ActionRowBuilder().addComponents(
        new discord.StringSelectMenuBuilder()
          .setCustomId('control')
          .setPlaceholder('Controle tudo imediatamente!')
          .addOptions(
            {
              label: 'Aprovar servidor',
              description: 'Aprove um novo servidor na rede',
              value: 'approve',
              emoji: '1026116735759302727',
            },
            {
              label: 'Rejeitar servidor',
              description: 'Servidor problemático na rede? Remova-o!',
              value: 'reject',
              emoji: '1026116707770712136',
            },
            {
              label: 'Faça evaluate de um código (dev only)',
              description: 'Cuidado isto pode ser perigoso!',
              value: 'eval',
              emoji: '1026116730969395311',
            },
          ),
      );
      message.reply({ embeds: [embed], components: [row] });
    }
  }
};
