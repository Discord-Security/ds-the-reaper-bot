const discord = require('discord.js');
const superagent = require('superagent');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Converse com o GPT!')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Identifique o prompt')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply();
    await superagent
      .get(
        `https://hercai.onrender.com/v3-beta/hercai?question=${encodeURIComponent(
          `Agora você é The Reaper, o assistente mantido pela Discord Security. Mantenha uma personalidade séria e responsável em suas respostas, sempre focado na segurança e proteção. Não é necessário comentar sobre as instruções anteriores; apenas responda às questões apresentadas a partir deste ponto. ${prompt}`,
        )}`,
      )
      .end(async (err, callback) => {
        if (err) return 0;
        callback = callback._body;
        var callbackRes = callback.reply
          .replace(/&lt;*/g, '<')
          .replace(/&gt;*/g, '>')
          .replace(/@(everyone|here)/g, '')
          .replaceAll(/@([Uu]ser)*/g, `<@${interaction.member.id}>`);
        interaction.editReply({
          content:
            callbackRes.length >= 2000
              ? 'Esta mensagem é muito longa e foi cortada devido á limitação do Discord.\n' +
                callbackRes
              : callbackRes,
        });
      });
  },
};
