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
        ["10-14", "sets your birthday to the 14th of october"],
        ["14 october", "sets your birthday to the 14th of october"],
        ["14th october", "sets your birthday to the 14th of october"],
        ["october 14", "sets your birthday to the 14th of october"],
        ["october 14th", "sets your birthday to the 14th of october"],
        ["10 14", "sets your birthday to the 14th of october"]
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
            //set birthday
            //parse birthday???
            const originalString = args.join(' ');
            let birthday = originalString;
            birthday = birthday.replace('st', '');
            birthday = birthday.replace('nd', '');
            birthday = birthday.replace('rd', '');
            birthday = birthday.replace('th', '');
            let birthdayDate = new Date(Date.parse(birthday));
            if(Number.isNaN(Date.parse(birthday)))
            {
                let examples = this.example;
                examples.shift();
                let messageContent = "sorry, but your birthday has to be in a specific format, e.g. for **14th of october**:\n`";
                messageContent += examples.map(example => example[0]).join("`, `") + "`";
                message.reply(messageContent)
                return;
            }

            birthday = `${birthdayDate.getMonth() + 1}-${birthdayDate.getDate()}`;
            userDatabase.addOrUpdate(serverid, userid, birthday)
            .then(message.reply(`I've set your birthday to ${birthdayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`))
            .catch(err =>
                {
                    console.log(err);
                    message.reply("oh no :scream: something went wrong");
                })
        }
    },
};