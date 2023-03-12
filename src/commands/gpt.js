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
    // Single Prompt
    const { fetch } = require('undici');

    (async () => {
      const response = await fetch('https://bing.khanh.lol/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: interaction.options.getString('prompt'),
        }),
      });
      const data = await response.json();

      if (data.response.size > 0)
        return interaction.editReply({
          content: data.response
            .replace('Bing', 'The Reaper')
            .replace('Sydney', 'The Reaper')
            .replace(/\[\^\d+\^]/g, '')
            .replace('@everyone', 'everyone')
            .replace('@here', 'here'),
        });
      else
        return interaction.editReply({
          content:
            'Consegui falhar miseravelmente ao tentar ter uma resposta, maldito GPT me bloqueando :(',
        });
    })();
  },
};
