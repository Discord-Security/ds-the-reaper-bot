const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
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
    activities: [{ name: 'Tóxicos? Aqui não!', type: 3 }],
    status: 'dnd',
  });
  const not = await client.db.Reaper.findOne({ _id: '1' });
  if (not) {
    not.databaseExclude.forEach(reps => {
      schedule.scheduleJob(reps.schedule, async function () {
        const reaper = await client.db.Reaper.findOne({ _id: '1' });
        if (reaper) {
          if (reaper.databaseExclude.find(item => item._id === reps._id)) {
            await client.db.Guilds.deleteOne({ _id: reps._id });
          }
        }
      });
    });
  }

  const AutoMsg = await client.db.Guilds.find({
    automessage: { $exists: true },
  });

  if (AutoMsg) {
    AutoMsg.automessage.forEach(async autoMsg => {
      const doc = await client.db.Guilds.findOne({ _id: AutoMsg._id });
      setInterval(() => {
        if (doc.automessage.find(c => c._id === autoMsg._id))
          client.channels.cache.get(autoMsg.channel).send(autoMsg._id);
      }, autoMsg.interval);
    });
  }

  const lockdownsForComplete = await client.db.Guilds.find({
    lockdownTime: { $exists: true },
  });
  if (lockdownsForComplete.length > 1) {
    lockdownsForComplete.maps(document => {
      schedule.scheduleJob(document.lockdownTime, async function () {
        await client.db.Guilds.updateOne(
          { _id: document._id },
          { $unset: { lockdownTime: 1 } },
        );
        const guild = await client.db.Guilds.findOne({
          _id: document._id,
        });
        const channels = client.guilds.cache
          .get(document._id)
          .channels.cache.filter(
            channel => channel.type === discord.ChannelType.GuildText,
          )
          .filter(
            channel =>
              channel
                .permissionsFor(document._id)
                .has(discord.PermissionFlagsBits.ViewChannel) === true,
          );
        channels.map(channel => {
          if (!guild.channelsLockdown.includes(channel.id)) return 0;
          guild.channelsLockdown.pull(channel.id);
          return channel.permissionOverwrites.set(
            [
              {
                id: document._id,
                allow: [discord.PermissionFlagsBits.SendMessages],
              },
            ],
            'Modo Lockdown desativado',
          );
        });
        guild.save();
      });
    });
  }
};
