const Discord = require('discord.js');
const moment = require('moment');

const {pollDatabase} = require('./Database/databases');

function PollManager(channelManager)
{
    this.channelManager = channelManager;
}

/**
 * Checks all open polls if they should be updated or closed
 */
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

/**
 * Updates a poll
 * @param poll poll to update
 */
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
    .catch(err =>
        {
            console.error(err);
            
            //if this message couldn't be retrieved, delete form database
            if(err.code === Discord.Constants.APIErrors.UNKNOWN_MESSAGE)
            {
                pollDatabase.remove({_id: poll._id});
            }
        });
}

/**
 * Closes a poll
 * @param poll poll to close
 */
PollManager.prototype.remove = function(poll)
{
    this.fetchMessage(poll.channelId, poll.messageId)
    .then(message =>
        {
            let messageContent = message.content;
            let endingString = `\nPoll has ended, the results are:\n`;

            endingString += this.fetchPollResults(poll, message.reactions.cache).join(', ');

            messageContent = messageContent.replace(/\n.*$/, endingString);
            return message.edit(messageContent);
        })
    .then(pollMessage =>
        {
            return pollMessage.unpin();
        })
    .then(pollMessage =>
        {
            let endMessage = `<@!${poll.userId}>s poll has ended, the results are:\n`
            endMessage += this.fetchPollResults(poll, pollMessage.reactions.cache).join(', ');
            return pollMessage.channel.send(endMessage);
        })
    .then(() =>
        {
            return pollDatabase.remove({_id: poll._id});
        })
    .catch(err => console.log(err));
}

/** 
 * Fetches a channel
 * @param {String} channelId snowflake of channel to fetch
 * @returns {Promise}
 */
PollManager.prototype.fetchChannel = function(channelId)
{
    return this.channelManager.fetch(channelId);
}

/** 
 * Fetches a message from a channel
 * @param {String} channelId snowflake of channel to fetch
 * @param {String} messageId snowflake of message to fetch
 * @returns {Promise}
 */
PollManager.prototype.fetchMessage = function(channelId, messageId)
{
    return this.fetchChannel(channelId)
    .then(channel =>
        {
            return channel.messages.fetch(messageId);
        });
}

/**
 * Fetches poll results from a cache
 * @param poll
 * @param reactionCache
 * @returns {String[]}
 */
PollManager.prototype.fetchPollResults = function(poll, reactionCache)
{
    let results = [];
    for (const emoji of poll.emojis)
    {
        const react = reactionCache.find(reaction => reaction.emoji.name === emoji.name && reaction.emoji.id === emoji.id);
        results.push(`${react.count - 1} voted for ${react.emoji}`);
    }
    return results;
}

module.exports = PollManager;
