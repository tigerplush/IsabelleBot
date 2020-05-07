const fetch = require('node-fetch');
const {apiUrl} = require('./config.json');

const {userDatabase} = require('./Database/databases.js');

module.exports =
{
    execute(channels)
    {
        const date = new Date(Date.now());
        const dateString = ((date.getMonth() + 1) + "-" + (date.getDay() + 1)).toString();

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
                    let announcement = "No villagers have a birthday today";
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
                            channel.send(announcement);
                        })
                    .catch(err =>
                        {
                            channel.send(announcement);
                            console.log(err);
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