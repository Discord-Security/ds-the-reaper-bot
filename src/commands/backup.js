const discord = require('discord.js');
const backup = require('discord-backup');

module.exports = {
  data: new discord.SlashCommandBuilder()
    .setName('backup')
    .setDescription('Gerencie uma cópia de segurança do seu servidor.')
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('criar')
        .setNameLocalizations({ 'pt-BR': 'criar', 'en-US': 'create' })
        .setDescription('Crie uma cópia de segurança do seu servidor'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('carregar')
        .setNameLocalizations({ 'pt-BR': 'carregar', 'en-US': 'load' })
        .setDescription('Carregue uma cópia de segurança do seu servidor')
        .addStringOption(option =>
          option
            .setName('backup_id')
            .setDescription('Escolha o ID do seu Backup.')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('senha')
            .setNameLocalizations({ 'pt-BR': 'senha', 'en-US': 'password' })
            .setDescription('Escreva a senha correta')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('apagar')
        .setNameLocalizations({ 'pt-BR': 'apagar', 'en-US': 'remove' })
        .setDescription('Apaga uma cópia de segurança do seu servidor')
        .addStringOption(option =>
          option
            .setName('backup_id')
            .setDescription('Escolha o ID do seu Backup.')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('senha')
            .setNameLocalizations({ 'pt-BR': 'senha', 'en-US': 'password' })
            .setDescription('Escreva a senha correta')
            .setRequired(true),
        ),
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options._subcommand;
    const senha = interaction.options.getString('senha');
    const backupID = interaction.options.getString('backup_id');
    const doc = await client.db.Guilds.findOne({
      _id: interaction.guild.id,
    });
    if (subcommand !== 'criar' && senha !== doc.backup.password)
      return interaction.reply({
        content: 'A senha digitada está errada.',
        ephemeral: true,
      });
    switch (subcommand) {
      case 'criar': {
        interaction.deferReply({ ephemeral: true });
        backup
          .create(interaction.guild, {
            maxMessagesPerChannel: 30,
            jsonSave: true,
            jsonBeautify: true,
            saveImages: 'base64',
            doNotBackup: ['emojis', 'bans'],
          })
          .then(async backupData => {
            let senhaGerada = null;
            if (
              doc.backup.password === undefined ||
              doc.backup.password === null ||
              doc.backup.password === ''
            ) {
              const array1 = [
                'cachorro',
                'frio',
                'crime',
                'mar',
                'vermelho',
                'samsung',
                'bom',
                'cabelo',
                'caminhão',
              ];
              const array2 = [
                'quente',
                'gelado',
                'bobo',
                'fogo',
                'branco',
                'nokia',
                'tijolo',
                'apimentado',
                'andante',
              ];

              senhaGerada =
                array1[Math.floor(Math.random() * array1.length)] +
                array2[Math.floor(Math.random() * array2.length)];
              doc.backup.password = senhaGerada;
              await doc.save();
            }
            interaction.editReply({
              content: `O seu backup foi concluído, porém guarde este código \`${
                backupData.id
              }\` para carregar o backup caso necessário. ${
                senhaGerada !== null
                  ? `\n\n\`Sua senha para todos os backups agora é: ${senhaGerada} \``
                  : ''
              }`,
              ephemeral: true,
            });
          });
        break;
      }
      case 'carregar': {
        interaction.reply({
          content: 'Carregando o backup...',
          ephemeral: true,
        });
        backup.load(backupID, interaction.guild, {
          clearGuildBeforeRestore: true,
        });
        break;
      }
      case 'apagar': {
        backup.remove(backupID);
        interaction.reply({
          content: 'Removido com sucesso!',
          ephemeral: true,
        });
        break;
      }
    }
  },
};
