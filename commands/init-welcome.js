const {channelDatabase} = require('../Database/databases.js');

module.exports =
{
    name: "init-welcome",
    hidden: true,
    usage: "",
    description: "Initialises this channel as welcome channel",
    example:
    [
        ["", "initialises this channel as welcome channel"],
    ],
    execute(message, args)
    {
        if(message.member.hasPermission("ADMINISTRATOR" || "MANAGE_CHANNELS" || "MANAGE_GUILD"))
        {
            const serverid = message.guild.id;
            const channelid = message.channel.id;
            channelDatabase.addChannel(serverid, channelid, "welcome")
            .then(message.reply("I've initialised this channel as welcome channel!"))
            .catch(err =>
                {
                    if(err)
                    {
                        message.reply("There was an error!");
                    }
                    else
                    {
                        message.reply("this channel is already initialised!");
                    }
                });
        }
        else
        {
            message.reply("sorry but you don't have the necessary rights :frown:");
        }
    },
};