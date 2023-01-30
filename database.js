const { connect, Schema, model, set } = require('mongoose');
const { ChalkAdvanced } = require('chalk-advanced');
const paginate = require('mongoose-paginate-v2');
set('strictQuery', true);

connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    console.log(
      `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.green(
        '✅ • Carregado com sucesso [BANCO DE DADOS]',
      )}`,
    ),
  )
  .catch(() =>
    console.log(
      `${ChalkAdvanced.gray('>')} ${ChalkAdvanced.red(
        '❎ • Conexão do banco de dados falhada',
      )}`,
    ),
  );

const userSchema = new Schema({
  _id: { type: String, required: true },
  warns: { type: Array },
});

const staffSchema = new Schema({
  _id: { type: String, required: true },
  serverIds: { type: Array },
});

const guildSchema = new Schema({
  _id: { type: String, required: true },
  approved: { type: Boolean, default: false },
  roleId: { type: String },
  channelsLockdown: { type: Array },
  channelsAutopublish: { type: Array },
  logs: {
    deletedMessage: { type: String },
    editedMessage: { type: String },
    joinedMember: { type: String },
    leftMember: { type: String },
    punishments: { type: String },
  },
  welcome: {
    active: { type: Boolean, default: false },
    channel: { type: String },
    content: {
      type: String,
      default:
        '{ "content": "Bem-vindo ao nosso servidor %membro, espero que se divirta aqui!" }',
    },
    timeout: { type: Number, default: 0 },
    roles: { type: Array },
  },
  exit: {
    active: { type: Boolean, default: false },
    channel: { type: String },
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
    channel: { type: String },
  },
  backup: {
    password: { type: String },
  },
  partner: {
    channel: { type: String },
    message: { type: String },
    role: { type: String },
  },
  partneractivated: { type: Boolean, default: false },
  partnerWarning: {
    activated: { type: Boolean, default: false },
    channel: { type: String },
    message: {
      type: String,
      default: '{ "content": "Obrigado pela parceria %representante!" }',
    },
  },
});

const partnerSchema = new Schema({
  _id: { type: String, required: true },
  serverId: { type: String, required: true },
  partners: { type: Number, default: 0 },
});
partnerSchema.plugin(paginate);

module.exports.Guilds = model('Guilds', guildSchema);
module.exports.Users = model('Users', userSchema);
module.exports.Staffs = model('Staffs', staffSchema);
module.exports.Partners = model('Partners', partnerSchema);