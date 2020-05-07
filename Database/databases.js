const {pathToDatabase, channelDb} = require('../config.json');

const ChannelDatabase = require('./ChannelDatabase.js');
const WelcomeMessageDatabase = require('./WelcomeMessageDatabase.js');

const channelDatabase = new ChannelDatabase(pathToDatabase, channelDb);
const welcomeMessageDatabase = new WelcomeMessageDatabase(pathToDatabase, 'welcomeMessage.db');

module.exports.channelDatabase = channelDatabase;
module.exports.welcomeMessageDatabase = welcomeMessageDatabase;