const Discord = require('discord.js');

module.exports =
{
    name: "init",
    hidden: true,
    usage: "",
    description: "Initialises this channel as announcement channel",
    example:
    [
        ["", "initialises this channel as announcement channel"],
    ],
    execute(message, args)
    {
        if(message.member.hasPermission("ADMINISTRATOR" || "MANAGE_CHANNELS" || "MANAGE_GUILD"))
        {
            message.client.database.addChannel(message.channel.id)
            .then(message.reply("I've initialised this channel as announcement channel!"))
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