const discord = require('discord.js');
const { fetch } = require('undici');

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
    await interaction.deferReply();
    const response = await fetch('https://bing.khann.lol/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: interaction.options.getString('prompt'),
      }),
    }).catch(() => gpt());
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
    else gpt();
    async function gpt() {
      const { ChatGPTUnofficialProxyAPI } = await import('chatgpt');
      const accounts = [
        client.OPENAI_ACCESS_TOKEN1,
        client.OPENAI_ACCESS_TOKEN2,
      ];
      const backends = ['https://gpt.pawan.krd/backend-api/conversation'];
      const api = new ChatGPTUnofficialProxyAPI({
        accessToken: accounts[Math.floor(Math.random() * accounts.length)],
        apiReverseProxyUrl:
          backends[Math.floor(Math.random() * backends.length)],
      });
      const res = await api
        .sendMessage(interaction.options.getString('prompt'))
        .catch(async err => {
          if (err)
            interaction.editReply({
              content:
                'Consegui falhar miseravelmente ao tentar ter uma resposta, maldito GPT me bloqueando :(',
            });
        });
      interaction.editReply({ content: res.text });
    }
  },
};
