const { connect, Schema, model, set } = require('mongoose');
const { ChalkAdvanced } = require('chalk-advanced');
const paginate = require('mongoose-paginate-v2');
set('strictQuery', true);

connect(process.env.DB, {})
  .then(() =>
    console.log(
      `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.green(
        '✅ • Carregado com sucesso [BANCO DE DADOS]',
      )}`,
    ),
  )
  .catch(err =>
    console.log(
      `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.red(
        '❎ • Conexão do banco de dados falhada',
      )}`,
      err,
    ),
  );

const userSchema = new Schema({
  _id: { type: String, required: true },
  warns: Array,
});

const staffSchema = new Schema({
  _id: { type: String, required: true },
  serverIds: Array,
});

const guildSchema = new Schema({
  _id: { type: String, required: true },
  approved: { type: Boolean, default: false },
  roleId: String,
  channelsLockdown: Array,
  channelsAutopublish: Array,
  lockdownTime: Date,
  logs: {
    deletedMessage: String,
    editedMessage: String,
    joinedMember: String,
    leftMember: String,
    punishments: String,
  },
  welcome: {
    active: { type: Boolean, default: false },
    channel: String,
    content: {
      type: String,
      default:
        '{ "content": "Bem-vindo ao nosso servidor %membro, espero que se divirta aqui!" }',
    },
    timeout: { type: Number, default: 0 },
    roles: Array,
  },
  exit: {
    active: { type: Boolean, default: false },
    channel: String,
    content: {
      type: String,
      default: '{ "content": "Adeus %membro, espero que voltemo-nos a ver!" }',
    },
    timeout: { type: Number, default: 0 },
  },
  antifake: {
    active: { type: Boolean, default: false },
    time: { type: Number, default: 7200000 },
    action: { type: String, default: 'Kick' },
    channel: String,
  },
  automessage: [
    {
      _id: String,
      channel: String,
      interval: Number,
    },
  ],
  backup: {
    password: String,
  },
  partnerWarning: {
    activated: { type: Boolean, default: false },
    channel: String,
    message: {
      type: String,
      default: '{ "content": "Obrigado pela parceria %representante!" }',
    },
  },
  rssfeeds: [
    {
      _id: String,
      channel: String,
      message: {
        type: String,
        default: '{ "content": "**%title**\\n%url" }',
      },
      disabled: Boolean,
      lastItem: { type: String, default: '' },
      penultimateItem: { type: String, default: '' },
    },
  ],
  vips: {
    roles: Array,
    registeredVips: [
      {
        _id: String,
        expires: Date,
        roleId: String,
      },
    ],
  },
});

const partnerSchema = new Schema({
  _id: { type: String, required: true },
  serverId: { type: String, required: true },
  partners: { type: Number, default: 0 },
});
partnerSchema.plugin(paginate);

const reaperSchema = new Schema({
  _id: { type: String, required: true },
  databaseExclude: [
    {
      _id: { type: String, required: true },
      schedule: { type: Date, required: true },
    },
  ],
});

module.exports.Guilds = model('Guilds', guildSchema);
module.exports.Users = model('Users', userSchema);
module.exports.Staffs = model('Staffs', staffSchema);
module.exports.Partners = model('Partners', partnerSchema);
module.exports.Reaper = model('Reaper', reaperSchema);
