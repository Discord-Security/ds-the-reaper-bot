const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
require('dotenv').config();
const { ChalkAdvanced } = require('chalk-advanced');
const schedule = require('node-schedule');

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
  client.db.Reaper.findOne({ _id: '1' }, function (err, not) {
    if (err) return;
    not.databaseExclude.forEach(reps => {
      schedule.scheduleJob(reps.schedule, async function () {
        client.db.Reaper.findOne({ _id: '1' }, async reaper => {
          if (reaper.databaseExclude.find(item => item._id === reps._id)) {
            await client.db.Guilds.deleteOne({ _id: reps._id });
          }
        });
      });
    });
  });
};
