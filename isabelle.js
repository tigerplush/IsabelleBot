const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const {prefix, welcomeRoles} = require('./config.json');
const cron = require('node-cron');
const update = require('./update.js');

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


cron.schedule('0 0 * * *', () =>
{
    channelDatabase.fetchAnnouncementChannels(bot.channels)
    .then(channels =>
        {
            update.execute(channels);
        })
    .catch(err => console.log(err));
});

bot.on('ready', () =>
{
    channelDatabase.fetchAnnouncementChannels(bot.channels)
    .then(channels =>
        {
            update.execute(channels);
        })
    .catch(err => console.log(err));
});

bot.on('guildMemberUpdate', (oldMember, newMember)=>
{
    //for every role
    welcomeRoles.map(welcomeRole =>
        {
            //check if updates user already had that role
            const oldRole = oldMember.roles.cache.find(role => role.name === welcomeRole);
            if(!oldRole)
            {
                //if not, check if he has it now
                const newRole = newMember.roles.cache.find(role => role.name === welcomeRole);
                if(newRole)
                {
                    const serverid = newMember.guild.id;
                    const userid = newMember.id;
                    console.log(`${welcomeRole}ified new member ${userid}`);

                    // look for welcoming channel
                    channelDatabase.fetchChannel(bot.channels, {serverid: serverid, type: "welcome"})
                    .then(channel =>
                        {
                            welcomeMessageDatabase.findMessage(serverid)
                            .then(messageContent => channel.send(messageContent))
                            .catch(err => console.log(err));
                            //write the welcome message
                        })
                    .catch(err => console.log(err));
                }
            }
        })
    
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
