const discord = require('discord.js');
const { BingChat } = await import('bing-chat');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Prazer, GPT por aqui.')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Você gostaria de deletar os canais de qual categoria?')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const prompt = interaction.options.getString('prompt');
    const api = new BingChat({
      cookie: process.env.BING_COOKIE,
    });

    interaction.deferReply();

    const res = await api.sendMessage(prompt).catch(async err => {
      if (err)
        interaction.editReply({
          content:
            'Consegui falhar miseravelmente ao tentar ter uma resposta, maldito GPT me bloqueando :(',
        });
    });
    interaction.editReply({
      content: res.text
        .replace('Bing', 'The Reaper')
        .replace(/\[\^\d+\^]/g, '')
        .replace('@everyone', 'everyone')
        .replace('@here', 'here'),
    });
  },
};
