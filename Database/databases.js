const {pathToDatabase, channelDb} = require('../config.json');

const ChannelDatabase = require('./ChannelDatabase.js');

const channelDatabase = new ChannelDatabase(pathToDatabase, channelDb);

module.exports.channelDatabase = channelDatabase;