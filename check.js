const fetch = require('node-fetch');
const moment = require('moment');
const {apiUrl} = require('./config.json');

const {userDatabase} = require('./Database/databases.js');

module.exports =
{
    execute(channels)
    {
        const date = new Date(Date.now());
        const dateString = ((date.getMonth() + 1) + "-" + (date.getDate())).toString();

        const info = {birthday: dateString};

        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(info)
        }

        fetch(apiUrl, options)
        .then(response => response.json())
        .then(json => {
            channels.map(channel =>
                {
                    let villagers = json.villager;
                    let announcement = "Hmmm... There really isn't any news to speak of today...";
                    if(villagers && villagers.length > 0)
                    {
                        if(villagers.length == 1)
                        {
                            announcement = "Today ";
                            announcement += villagers[0].name;
                            announcement += " is celebrating ";
                            announcement += genderify(villagers[0]);
                            announcement += " birthday!";
                        }
                        else if(villagers.length == 2)
                        {
                            announcement = villagers.map(villager => villager.name).join(" and ") + " are celebrating their birthdays today!";
                        }
                        else
                        {
                            const lastVillager = villagers.pop();
                            announcement = villagers.map(villager => villager.name).join(", ") + ", and " + lastVillager.name + " are celebrating their birthdays today!";
                        }
                    }

                    userDatabase.find(info)
                    .then(users =>
                        {
                            if(users && users.length > 0)
                            {
                                announcement += `\nAlso, a happy birthday to our family `;
                                if(users.length == 1)
                                {
                                    announcement += `member <@${users[0].userid}>`;
                                }
                                else if(users.length == 2)
                                {
                                    announcement += "members <@" + users.map(user => user.userid).join("> and <@") + ">";
                                }
                                else
                                {
                                    const lastUser = users.pop();
                                    announcement += "members <@" + users.map(user => user.userid).join(">, <@") + `>, and <@${lastUser.userid}>`;
                                }
                                announcement += "! :tada:"
                            }
                        })
                    .catch(err =>
                        {
                            console.log(err);
                        })
                    .finally(() =>
                    {
                        const guildName = channel.guild.name;
                        const time = moment().format("h:mm A [(GMT)] [on] dddd, MMMM Do, YYYY");
                        let messageContent = `Good day, everyone!`;
                        messageContent += `\nRight now on **${guildName}** it's ${time}.`;
                        messageContent += `\n${announcement}`;
                        messageContent += `\nThat's all for today... Have a fun day out there!`;
                        channel.send(messageContent)
                    });
                });
        })
        .catch(err => console.log(err));
    }
};

function possesify(name)
{
    if(name.endsWith("s"))
    {
        name += "'";
    }
    else
    {
        name += "s";
    }
    return name;
}

function genderify(villager)
{
    if(villager.gender === "male")
    {
        return "his";
    }
    else
    {
        return "her";
    }
}