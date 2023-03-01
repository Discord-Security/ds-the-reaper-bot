const discord = require('discord.js');
const ms = require('ms-pt-br');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('welcome')
    .setNameLocalizations({
      'pt-BR': 'bem-vindo',
      'en-US': 'welcome',
    })
    .setDescription('Personalize o seu welcome do seu jeitinho!')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal')
        .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
        .setDescription('Defina um canal')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel' })
            .setDescription('Identifique o canal')
            .addChannelTypes(discord.ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('tempo')
        .setNameLocalizations({ 'pt-BR': 'tempo', 'en-US': 'time' })
        .setDescription('Defina um tempo limite para apagar a mensagem')
        .addStringOption(option =>
          option
            .setName('tempo')
            .setNameLocalizations({ 'pt-BR': 'tempo', 'en-US': 'time' })
            .setDescription('Identifique o tempo (ex: 1d, 1m, 1s)')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ativar')
        .setNameLocalizations({ 'pt-BR': 'ativar', 'en-US': 'activate' })
        .setDescription('Ative ou desative o sistema.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mensagem')
        .setNameLocalizations({ 'pt-BR': 'mensagem', 'en-US': 'message' })
        .setDescription('Defina a mensagem de bem-vindo.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('addrole')
        .setNameLocalizations({ 'pt-BR': 'adicionarcargo', 'en-US': 'addrole' })
        .setDescription('Adicione um cargo para ser oferecido ao entrar.')
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setNameLocalizations({ 'pt-BR': 'cargo', 'en-US': 'role' })
            .setDescription('Mencione o cargo')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('removerole')
        .setNameLocalizations({
          'pt-BR': 'removercargo',
          'en-US': 'removerole',
        })
        .setDescription('Remove um cargo do autorole.')
        .addRoleOption(option =>
          option
            .setName('cargo')
            .setNameLocalizations({ 'pt-BR': 'cargo', 'en-US': 'role' })
            .setDescription('Mencione o cargo')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('exportar')
        .setNameLocalizations({ 'pt-BR': 'exportar', 'en-US': 'export' })
        .setDescription('Exportar o conteúdo da mensagem de welcome.'),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const channel = interaction.options.getChannel('canal') || null;
    const time = interaction.options.getString('tempo') || null;
    const cargo = interaction.options.getRole('cargo') || null;
    const doc = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    });
    switch (subcommand) {
      case 'canal': {
        doc.welcome.channel = channel.id;
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'tempo': {
        const intfinal = ms(time);
        if (!intfinal)
          return interaction.reply({
            content:
              'Tempo inválido! Tente usar 1d, 1h ou 1m. Se desejar remover esse tempo, defina 0s.',
          });
        doc.welcome.timeout = intfinal;
        doc.save();
        interaction.reply({ content: 'Sucesso!', ephemeral: true });
        break;
      }
      case 'ativar': {
        doc.welcome.active = !doc.welcome.active;
        doc.save();
        interaction.reply({
          content: `${
            doc.welcome.active ? 'Ativado' : 'Desativado'
          } com sucesso!`,
          ephemeral: true,
        });
        break;
      }
      case 'exportar': {
        interaction.reply({
          content: 'Embaixo foi exportado o arquivo JSON!',
          files: [
            new discord.AttachmentBuilder(
              Buffer.from(
                JSON.stringify(doc.welcome.content, null, 2)
                  .substring(
                    1,
                    JSON.stringify(doc.welcome.content, null, 2).length - 1,
                  )
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\/g, '\\n'),
              ),
              {
                name: 'welcome.json',
              },
            ),
          ],
        });
        break;
      }
      case 'mensagem': {
        interaction.reply({
          content:
            'Você escolheu a opção de mensagem. Para personalizar sua mensagem, visite o site https://glitchii.github.io/embedbuilder/. Por favor, lembre-se das variáveis de boas-vindas disponíveis na nossa documentação. Você tem 5 minutos para enviar a mensagem de boas-vindas ou digite cancelar para cancelar a nova mensagem.',
        });
        const filter = m => interaction.user.id === m.author.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 300000,
          max: 1,
        });

        collector.on('collect', async m => {
          if (m.content === 'cancelar') return 0;
          try {
            const pe = JSON.parse(m.content);
            interaction.channel.send(pe).catch(() => {
              return interaction.channel.send(
                'A Mensagem que você enviou está com erros para ser testada, mas não se preocupe a verificação principal foi certificada!',
              );
            });
            const doc = await client.db.Guilds.findOne({
              _id: interaction.guild.id,
            });
            doc.welcome.content = m.content;
            doc.save();
          } catch (err) {
            return interaction.channel.send(
              'Seu JSON é inválido para minha inteligência, veja se você copiou tudo!',
            );
          }
        });
        break;
      }
      case 'addrole': {
        doc.welcome.roles.push(cargo.id);
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
      case 'removerole': {
        doc.welcome.roles.pull(cargo.id);
        doc.save();
        interaction.reply({
          content: 'Sucesso!',
          ephemeral: true,
        });
        break;
      }
    }
  },
};
