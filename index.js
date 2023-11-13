const discord = require('discord.js');
require('dotenv').config();

const client = new discord.Client({
  intents: 3276799,
  cacheWithLimits: {
    MessageManager: {
      sweepInterval: 300,
      sweepFilter: discord.Sweepers.filterByLifetime({
        lifetime: 60,
        getComparisonTimestamp: m => m.editedTimestamp ?? m.createdTimestamp,
      }),
    },
  },
});

client.cor = '#ff0000';
client.db = require('./database');
client.canais = {
  logs: '1025780160437432330',
  serverLogs: '1058047241346105465',
  raidAlerts: '1053827079000571936',
  strikes: '1039126395445596180',
  errors: '1025774984402059438',
};
client.request = new (require('rss-parser'))();

/**
 * Tenta enviar uma mensagem para um canal específico.
 * @param {string} channelID - O ID do canal.
 * @param {string} guild - O objeto do servidor.
 * @param {string} message - A mensagem a ser enviada caso o canal exista.
 * @param {string} errorMessage - A mensagem a ser enviada para strikes caso o canal não exista.
 */
client.trySend = async (channelID, guild, message, errorMessage) => {
  const Guilds = await client.db.Guilds.findOne({ _id: guild.id });
  let mention =
    Guilds.roleId !== undefined ? '&' + Guilds.roleId : guild.ownerID;
  mention = `<@${mention}>`;
  Promise.resolve(client.channels.fetch(channelID))
    .then(channel => {
      channel.send(message).catch(err => {
        client.channels.cache.get(client.canais.strikes).send({
          content: `${mention}, seu servidor **${guild.name}** (\`${guild.id}\`) falhou ao enviar ${errorMessage}:\n\`\`\`${err}\`\`\``,
        });
      });
    })
    .catch(err => {
      client.channels.cache.get(client.canais.strikes).send({
        content: `${mention}, seu servidor **${guild.name}** (\`${guild.id}\`) falhou ao enviar ${errorMessage}:\n\`\`\`${err}\`\`\``,
      });
    });
};

process.on('unhandledRejection', async error => {
  console.log(error);
  const lista = await new discord.AttachmentBuilder(
    Buffer.from(error.toString()),
    {
      name: 'unhandledRejection.js',
    },
  );
  try {
    client.channels.cache.get(client.canais.errors).send({ files: [lista] });
  } catch {}
});
process.on('uncaughtException', async error => {
  console.log(error);
  const lista = await new discord.AttachmentBuilder(
    Buffer.from(error.toString()),
    {
      name: 'uncaughtException.js',
    },
  );
  try {
    client.channels.cache.get(client.canais.errors).send({ files: [lista] });
  } catch {}
});

const boilerplateComponents = async () => {
  await require('./src/util/boilerplateClient')(client);
};

boilerplateComponents();
