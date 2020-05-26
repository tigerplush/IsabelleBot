const moment = require('moment');

const {pollDatabase} = require('./Database/databases');

function PollManager(channelManager)
{
    this.channelManager = channelManager;
}

PollManager.prototype.check = function()
{
    pollDatabase.find({})
    .then(polls =>
        {
            polls.forEach(poll => {
                if(Date.now() > poll.endingTimestamp)
                {
                    this.remove(poll);
                }
                else
                {
                    this.update(poll);
                }
            });
        })
    .catch(err => console.log(err));
}

PollManager.prototype.update = function(poll)
{
    this.fetchMessage(poll.channelId, poll.messageId)
    .then(message =>
        {
            let messageContent = message.content;
            let endingTime = moment(poll.endingTimestamp);
            messageContent = messageContent.replace(/\n.*$/, `\nPoll ends ${endingTime.fromNow()}`);
            return message.edit(messageContent);
        })
    .catch(err => console.log(err));
}

PollManager.prototype.remove = function(poll)
{
    this.fetchMessage(poll.channelId, poll.messageId)
    .then(message =>
        {
            let messageContent = message.content;
            let endingString = `\nPoll has ended`;
            messageContent = messageContent.replace(/\n.*$/, endingString);
            return message.edit(messageContent);
        })
    .then(() =>
        {
            return pollDatabase.remove({_id: poll._id});
        })
    .catch(err => console.log(err));
}

PollManager.prototype.fetchChannel = function(channelId)
{
    return this.channelManager.fetch(channelId);
}

PollManager.prototype.fetchMessage = function(channelId, messageId)
{
    return this.fetchChannel(channelId)
    .then(channel =>
        {
            return channel.messages.fetch(messageId);
        })
}

module.exports = PollManager;
