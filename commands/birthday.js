const {userDatabase} = require('../Database/databases.js');

module.exports =
{
    name: "birthday",
    hidden: false,
    usage: "birthday",
    description: "Sets or returns your birthday",
    example:
    [
        ["", "tells you your current birthday... In case you forgot"],
        ["10-14", "sets your birthday to the 14th of october"]
    ],
    execute(message, args)
    {
        const serverid = message.guild.id;
        const userid = message.author.id;
        if(args.length == 0)
        {
            // tell birthday
            userDatabase.findUser(serverid, userid)
            .then(user =>
                {
                    message.reply(`your birthday is ${user.birthday}`);
                })
            .catch(err =>
                {
                    console.log(err);
                    message.reply("couldn't find you in my database! :frowning:");
                });
        }
        else
        {
            // set birthday
            //parse birthday???
            const birthday = args[0];
            if(!/^1?[0-9]-[1-3]?[0-9]$/.test(birthday))
            {
                message.reply("sorry, but for now your birthday has to be in the format month-day, e.g `10-14`");
                return;
            }

            userDatabase.addOrUpdate(serverid, userid, birthday)
            .then(message.reply(`I've set your birthday to ${birthday}`))
            .catch(err =>
                {
                    console.log(err);
                    message.reply("oh no :scream: something went wrong");
                })
        }
    },
};