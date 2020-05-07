const {pathToDatabase, channelDb, welcomeMessageDb, userDb} = require('../config.json');

const ChannelDatabase = require('./ChannelDatabase.js');
const WelcomeMessageDatabase = require('./WelcomeMessageDatabase.js');
const UserDatabase = require('./UserDatabase.js');

const channelDatabase = new ChannelDatabase(pathToDatabase, channelDb);
const welcomeMessageDatabase = new WelcomeMessageDatabase(pathToDatabase, welcomeMessageDb);
const userDatabase = new UserDatabase(pathToDatabase, userDb);

module.exports.channelDatabase = channelDatabase;
module.exports.welcomeMessageDatabase = welcomeMessageDatabase;
module.exports.userDatabase = userDatabase;