const {welcomeMessageDatabase} = require('../Database/databases.js');

module.exports =
{
    name: "welcome-message",
    hidden: true,
    usage: "",
    description: "Gives basic info about this bot",
    example:
        [
            ["", "posts basic information about this bot"]
        ],
    execute(message, args)
    {
        if(message.member.hasPermission("ADMINISTRATOR" || "MANAGE_CHANNELS" || "MANAGE_GUILD"))
        {
            const serverid = message.guild.id;
            const welcomeMessage = args.join(' ');
            welcomeMessageDatabase.add({serverid: serverid, welcomeMessage: welcomeMessage})
            .then(() => message.reply("I've set your welcoming message"))
            .catch(err =>
                {
                    console.log(err);
                    message.reply("there was an error setting the welcoming message :frown:");
                });
        }
        else
        {
            message.reply("sorry but you don't have the necessary rights :frown:");
        }
    },
};