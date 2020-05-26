const moment = require('moment');

const {pollDatabase} = require('../Database/databases.js');

module.exports =
{
    name: "create-poll",
    hidden: false,
    usage: "",
    description: "Creates a poll - dms you for more information",
    example:
    [
        ["", "creates a poll and dms you for more information"]
    ],
    execute(message, args)
    {
        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const userId = message.author.id;
        const emojis = [];

        let dmChannel = {};
        let endingTime = {};
        let pollContent = "";
        let options = 0;
        let pollAttachments = {};
        let messageId = "";

        message.reply(`I'm going to send you a dm to ask for more informations!`)
        .then(() =>
            {
                return message.author.createDM();
            })
        .then(channel =>
            {
                dmChannel = channel;
                let messageContent = `How long will the poll run?`;
                messageContent += `Answer with \`hh:mm:ss\` or \`d hh:mm:ss\`, e.g. \`01:00:00\` for a runtime of 1 hours or \`7 00:00:00\` for a runtime of 7 days`;
                return dmChannel.send(messageContent);
            })
        .then(() =>
            {
                const filter = dm => dm;
                return dmChannel.awaitMessages(filter, {max: 1, time: 3*60*1000, errors: ['time']});
            })
        .then(collectedMessages =>
            {
                const timeString = collectedMessages.first().content;
                const time = moment.duration(timeString);
                if(time)
                {
                    endingTime = moment().add(time);
                    let messageContent = `Good, the poll will end ${endingTime.fromNow()}`;
                    messageContent += `\nNow if you just give me your poll text. Be sure to use \`!option\` for every option you want people to vote for`;
                    return dmChannel.send(messageContent);
                }

                dmChannel.send(`Sorry, that is not a valid time :(`)
                .catch(err => console.log(err));
                throw new Error(`${timeString} is not a valid duration`);
            })
        .then(() =>
            {
                const filter = dm => dm;
                return dmChannel.awaitMessages(filter, {max: 1, time: 3*60*1000, errors: ['time']});
            })
        .then(collectedMessages =>
            {
                pollContent = collectedMessages.first().content;
                pollAttachments = collectedMessages.first().attachments.array();
                let option = new RegExp("!option", "gi");
                while(result = option.exec(pollContent))
                {
                    options++;
                }
                if(options === 0)
                {
                    throw new Error(`No options have been defined, poll is useless`);
                }

                let p = Promise.resolve();

                for (let i = 0; i < options; i++)
                {
                    p = p.then(()=>
                        {
                            let messageContent = `Please react to this message with an emoji for option ${i + 1}`;
                            return message.channel.send(messageContent);
                        })
                    .then(message =>
                        {
                            const filter = (reaction, user) => user.id === userId;
                            return message.awaitReactions(filter, {max: 1, time: 3*60*1000, errors: ['time']});
                        })
                    .then(messageReaction =>
                        {
                            emojis.push(messageReaction.first().emoji);
                            return messageReaction.first().message.delete();
                        })
                    .catch(err => console.error(err));
                }

                return p;
            })
        .then(() =>
            {
                let messageContent = `<@!${userId}> has created a poll:\n`;
                messageContent += pollContent;
                for(let i = 0; i < options; i++)
                {
                    messageContent = messageContent.replace(`!option`, `${emojis[i]}`);
                }
                messageContent += `\nPoll ends ${endingTime.fromNow()}`;
                return message.channel.send(messageContent, pollAttachments);
            })
        .then(pollMessage =>
            {
                messageId = pollMessage.id;
                let p = Promise.resolve();
                for(let i = 0; i < options; i++)
                {
                    p = p.then(() =>
                    {
                        return pollMessage.react(emojis[i]);
                    });
                }

                return p;
            })
        .then(() =>
            {
                const reducedEmojis = emojis.map(emoji =>
                    {
                        return {name: emoji.name, id: emoji.id};
                    })

                return pollDatabase.add(
                    {
                        guildId: guildId
                        ,channelId: channelId
                        ,userId: userId
                        ,messageId: messageId
                        ,endingTimestamp: endingTime.valueOf()
                        ,pollContent: pollContent
                        ,emojis: reducedEmojis
                    })
            })
        .catch(err => console.error(err));
    },
};