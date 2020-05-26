const {pathToDatabase, channelDb, welcomeMessageDb, userDb} = require('../config.json');

const Database = require('./Database');
const ChannelDatabase = require('./ChannelDatabase');
const WelcomeMessageDatabase = require('./WelcomeMessageDatabase');
const UserDatabase = require('./UserDatabase');

const channelDatabase = new ChannelDatabase(pathToDatabase, channelDb);
const welcomeMessageDatabase = new WelcomeMessageDatabase(pathToDatabase, welcomeMessageDb);
const userDatabase = new UserDatabase(pathToDatabase, userDb);
const pollDatabase = new Database(pathToDatabase, 'polls.db');

module.exports.channelDatabase = channelDatabase;
module.exports.welcomeMessageDatabase = welcomeMessageDatabase;
module.exports.userDatabase = userDatabase;
module.exports.pollDatabase = pollDatabase;