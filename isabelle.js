const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const {prefix, welcomeRoles, welcomingTimeout, minimumTime, maximumTime} = require('./config.json');
const cron = require('node-cron');
const check = require('./check.js');
const moment = require('moment');

const PollManager = require('./PollManager');

const {channelDatabase, welcomeMessageDatabase} = require('./Database/databases.js');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    bot.commands.set(command.name, command);
}

const pollManager = new PollManager(bot.channels);

//run every minute
cron.schedule('*/1 * * * *', () =>
{
    pollManager.check();
});

//run every day at 10:45 GMT
cron.schedule('45 10 * * *', () =>
{
    let minimumDuration = moment.duration(minimumTime).asSeconds();
    let maximumDuration = moment.duration(maximumTime).asSeconds();
    let randomDuration = minimumDuration + (Math.random() * (maximumDuration - minimumDuration));
    setTimeout(() =>
    {
        channelDatabase.fetchAnnouncementChannels(bot.channels)
        .then(channels =>
            {
                check.execute(channels);
            })
        .catch(err => console.log(err));
    }, randomDuration * 1000);
});

bot.on('ready', () =>
{
});

bot.on('guildMemberUpdate', (oldMember, newMember)=>
{
    //for every role
    welcomeRoles.map(welcomeRole =>
        {
            //check if updates user already had that role
            const oldRoleCache = oldMember.roles.cache;
            if(!oldRoleCache.has(welcomeRole))
            {
                const newRoleCache = newMember.roles.cache;
                if(newRoleCache.has(welcomeRole))
                {
                    const newRole = newRoleCache.get(welcomeRole);
                    const serverid = newMember.guild.id;
                    const userid = newMember.id;
                    console.log(`${newRole.name}ified new member ${userid}`);
                    let welcomeChannel = {};
                    // look for welcoming channel
                    channelDatabase.fetchChannel(bot.channels, {serverid: serverid, type: "welcome"})
                    .then(channel =>
                        {
                            welcomeChannel = channel;
                            return channelDatabase.findChannel(serverid, "welcome");
                        })
                    .then(channelInfo =>
                        {
                            const timeoutDuration = moment.duration(welcomingTimeout);
                            const timeout = moment().subtract(timeoutDuration);
                            const lastMessage = moment(parseInt(channelInfo.lastMessageTimestamp));
                            console.log(timeout.diff(lastMessage));
                            return timeout.diff(lastMessage) < 0;
                        })
                    .catch(err =>
                        {
                            console.log(err);
                            return false;
                        })
                    .then(timeout =>
                        {
                            console.log(timeout);
                            if(!timeout)
                            {
                                //find the welcome message in the database and send it to the welcoming channel
                                welcomeMessageDatabase.findMessage(serverid)
                                .then(messageContent => welcomeChannel.send(messageContent))
                                .catch(err => console.log(err));
                                channelDatabase.updateTimestamp(serverid);
                            }
                            else
                            {
                                console.log("welcoming is still on cooldown");
                            }
                        })
                    .catch(err => console.log(err));
                }
            }
        });
});

bot.on('message', message => {
    if(message.content.startsWith(prefix) && !message.author.bot)
    {
        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        if (!bot.commands.has(command))
        {
            return;
        }

        try
        {
            bot.commands.get(command).execute(message, args);
        } catch (error)
        {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
});

bot.login(auth.token)
.catch(err => console.log(err));
