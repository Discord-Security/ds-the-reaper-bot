const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { readdirSync } = require('fs');
require('dotenv').config();
const { ChalkAdvanced } = require('chalk-advanced');
const schedule = require('node-schedule');
const discord = require('discord.js');

module.exports = async client => {
  const commandFiles = readdirSync('./src/commands/').filter(file =>
    file.endsWith('.js'),
  );

  const commands = [];

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  }

  const rest = new REST({
    version: '10',
  }).setToken(process.env.TOKEN);

  (async () => {
    try {
      if (process.env.STATUS === 'PRODUCTION') {
        // If the bot is in production mode it will load slash commands for all guilds
        await rest.put(Routes.applicationCommands(client.user.id), {
          body: commands,
        });
        console.log(
          `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.green(
            'Sucesso registrado comandos globalmente',
          )}`,
        );
      } else {
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
          {
            body: commands,
          },
        );

        console.log(
          `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.green(
            'Sucesso registrado comandos localmente',
          )}`,
        );
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
  client.user.setPresence({
    activities: [{ name: 'Tóxicos? Aqui não!', type: discord.ActivityType.Custom }],
    status: 'dnd',
  });
  const not = await client.db.Reaper.findOne({ _id: '1' });
  if (not) {
    not.databaseExclude.forEach(reps => {
      schedule.scheduleJob(reps.schedule, async function () {
        const reaper = await client.db.Reaper.findOne({ _id: '1' });
        if (reaper) {
          if (reaper.databaseExclude.find(item => item._id === reps._id)) {
            const doc = await client.db.Guilds.findOne({ _id: reps.id });
            if (doc && doc.roleId) {
              const role = client.guilds.cache
                .get('1025774982980186183')
                .roles.cache.get(doc.roleId);
              if (!role) return 0;
              if (role.members)
                role.members.map(member => {
                  if (member.roles.length > 2) return 0;
                  member.roles.remove('1025774982980186186');
                  return member.roles.add('1055623367937507438');
                });
              role.delete();
            }
            await client.db.Guilds.deleteOne({ _id: reps._id });
          }
        }
      });
    });
  }

  setInterval(RSS, 60000);
  RSS();

  async function RSS() {
    const guildsWithRssFeeds = await client.db.Guilds.find({
      rssfeeds: { $exists: true },
    });

    if (guildsWithRssFeeds.length > 0) {
      guildsWithRssFeeds.map(async guild => {
        guild.rssfeeds.map(async rssFeed => {
          try {
            const data = await client.request.parseURL(rssFeed._id);
            if (
              (data.items && rssFeed.lastItem === data.items[0].link) ||
              (data.items && rssFeed.penultimateItem === data.items[0].link)
            )
              return 0;
            let message;
            try {
              message = JSON.parse(
                rssFeed.message
                  .replace('%title', data.items[0].title.replace('&quot;', '"'))
                  .replace('%url', data.items[0].link)
                  .replace('%creator', data.items[0].creator)
                  .replace('%guid', data.items[0].guid)
                  .replace('%date', Date.now(data.items[0].pubDate)),
              );
            } catch (err) {
              return new Error(
                `Falhou o JSON Parse de ${guild._id} - ${rssFeed._id} com: \n` +
                  err,
              );
            }

            if (message)
              Promise.resolve(client.channels.fetch(rssFeed.channel))
                .then(channel => {
                  channel
                    .send(message)
                    .then(async () => {
                      await client.db.Guilds.findOneAndUpdate(
                        {
                          '_id': guild._id,
                          'rssfeeds._id': rssFeed._id,
                        },
                        {
                          $set: {
                            'rssfeeds.$.penultimateItem': rssFeed.lastItem,
                            'rssfeeds.$.lastItem': data.items[0].link,
                          },
                        },
                        { new: true },
                      );
                    })
                    .catch(() => {
                      return 0;
                    });
                })
                .catch(() => {
                  return 0;
                });
          } catch (err) {
            return 0;
          }
        });
      });
    }
  }

  const guildsWithAutoMessage = await client.db.Guilds.find({
    automessage: { $exists: true },
  });

  guildsWithAutoMessage.map(async currentGuild => {
    const guild = await client.db.Guilds.findOne({ _id: currentGuild._id });
    const autoMessages = currentGuild.automessage;
    if (autoMessages.length > 0) {
      autoMessages.forEach(currentAutoMsg => {
        setInterval(() => {
          if (guild.automessage.find(c => c._id === currentAutoMsg._id))
            client.channels.cache
              .get(currentAutoMsg.channel)
              .send(currentAutoMsg._id);
        }, currentAutoMsg.interval);
      });
    }
  });

  const guildsWithLockdown = await client.db.Guilds.find({
    lockdownTime: { $exists: true },
  });

  if (guildsWithLockdown.length > 0) {
    for (const guild of guildsWithLockdown) {
      schedule.scheduleJob(guild.lockdownTime, async function () {
        await client.db.Guilds.updateOne(
          { _id: guild._id },
          { $unset: { lockdownTime: 1 } },
        );

        const updatedGuild = await client.db.Guilds.findOne({
          _id: guild._id,
        });

        const channels = client.guilds.cache
          .get(guild._id)
          .channels.cache.filter(
            channel => channel.type === discord.ChannelType.GuildText,
          )
          .filter(channel =>
            channel
              .permissionsFor(guild._id)
              .has(discord.PermissionFlagsBits.ViewChannel),
          );

        for (const channel of channels) {
          if (!updatedGuild.channelsLockdown.includes(channel.id)) {
            continue;
          }

          updatedGuild.channelsLockdown.pull(channel.id);
          channel.permissionOverwrites.set(
            [
              {
                id: document._id,
                allow: [discord.PermissionFlagsBits.SendMessages],
              },
            ],
            'Modo Lockdown desativado',
          );
        }

        updatedGuild.save();
      });
    }
  }
};
