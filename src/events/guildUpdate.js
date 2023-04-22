module.exports = async (client, oldGuild, newGuild) => {
  if (oldGuild.name !== newGuild.name) {
    const doc = await client.db.Guilds.findOne({ _id: newGuild.id });

    if (!doc || !doc.roleId) return 0;
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    guild.roles.get(doc.roleId).setName(newGuild.name);
  }
};
