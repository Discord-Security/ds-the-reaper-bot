const discord = require('discord.js');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Prazer, GPT por aqui.')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Escreva algo no prompt e eu te responderei!')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const prompt = interaction.options.getString('prompt');
    const { BingChat } = await import('bing-chat');
    const api = new BingChat({
      cookie: process.env.BING_COOKIE,
    });

    interaction.deferReply();

    const res = await api.sendMessage(prompt).catch(err => {
      if (err)
        interaction.editReply({
          content:
            'Consegui falhar miseravelmente ao tentar ter uma resposta, maldito GPT me bloqueando :(',
        });
    });
    if (res.text.size > 0)
      return interaction.editReply({
        content: res.text
          .replace('Bing', 'The Reaper')
          .replace(/\[\^\d+\^]/g, '')
          .replace('@everyone', 'everyone')
          .replace('@here', 'here'),
      });
    else
      return interaction.editReply({
        content:
          'Consegui falhar miseravelmente ao tentar ter uma resposta, maldito GPT me bloqueando :(',
      });
  },
};
