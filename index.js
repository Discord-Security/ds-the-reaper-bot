const discord = require('discord.js');
const schedule = require('node-schedule');
require('dotenv').config();
const { Authenticator } = import('openai-authenticator');

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
client.OPENAI_ACCESS_TOKEN1 = new Authenticator().login(
  process.env.CHATGPT1_EMAIL,
  process.env.CHATGPT1_PASSWORD,
);
client.OPENAI_ACCESS_TOKEN2 = new Authenticator().login(
  process.env.CHATGPT2_EMAIL,
  process.env.CHATGPT2_PASSWORD,
);
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
          content: `${mention}, seu servidor ${guild.name} falhou ao enviar ${errorMessage}: ${err}`,
        });
      });
    })
    .catch(err => {
      client.channels.cache.get(client.canais.strikes).send({
        content: `${mention}, seu servidor ${guild.name} falhou ao enviar ${errorMessage}: ${err}`,
      });
    });
};

process.on('unhandledRejection', async error => {
  console.log(error);
  const lista = await new discord.AttachmentBuilder(
    Buffer.from(error.toString()),
    {
      name: 'unhandledRejection.txt',
    },
  );
  client.channels.cache.get(client.canais.errors).send({ files: [lista] });
});
process.on('uncaughtException', async error => {
  console.log(error);
  const lista = await new discord.AttachmentBuilder(
    Buffer.from(error.toString()),
    {
      name: 'uncaughtException.txt',
    },
  );
  client.channels.cache.get(client.canais.errors).send({ files: [lista] });
});

schedule.scheduleJob('00 16 * * 1', async function () {
  const part = await client.db.Guilds.find({
    partneractivated: true,
  });
  part.map(g => {
    let i = 0;
    return part.forEach(p => {
      setTimeout(async function () {
        if (p.id === g.id) return;
        if (!g.partner.message || g.partner.message.length < 1) {
          const doc = await client.db.Guilds.findOne({ _id: g._id });
          if (doc) {
            client.channels.cache.get(client.canais.strikes).send({
              content: `Servidor ${g._id} falhou ao enviar mensagem de parceria, mensagem sem conteúdo ou inválida. \n\nPara tentar reativar sem nenhum erro, cumpra o que o erro peça e use novamente o comando de /parceria canal`,
            });
            doc.partneractivated = false;
            return doc.save();
          }
        }
        client.channels.cache
          .get(p.partner.channel)
          .send({
            content:
              g.partner.message.replace('@here', '').replace('@everyone', '') +
              `\n\n<@&${p.partner.role}>`,
          })
          .catch(async err => {
            if (err) console.log(err);
            const doc = await client.db.Guilds.findOne({ _id: p._id });
            if (doc) {
              client.channels.cache.get(client.canais.strikes).send({
                content: `Servidor ${p._id} falhou ao enviar mensagem de parcerias: \n\n\`\`\`${err}\`\`\`\n\nPara tentar reativar sem nenhum erro, cumpra o que o erro peça e use novamente o comando de /parceria canal`,
              });
              doc.partneractivated = false;
              doc.save();
            }
          });
      });
    }, 15000 * i++);
  });
});

const boilerplateComponents = async () => {
  await require('./src/util/boilerplateClient')(client);
};

boilerplateComponents();
