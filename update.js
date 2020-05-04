const fetch = require('node-fetch');
const {apiUrl, port, path} = require('./config.json');
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
                    if(villagers && villagers.length > 0)
                    {
                        let announcement = "";
                        if(villagers.length == 1)
                        {
                            announcement += "Today ";
                            announcement += villagers[0].name;
                            announcement += " is celebrating ";
                            announcement += genderify(villagers[0]);
                            announcement += " birthday!";
                        }
                        else if(villagers.length == 2)
                        {
                            announcement += villagers.map(villager => villager.name).join(" and ") + " are celebrating their birthdays today!";
                        }
                        else
                        {
                            lastVillager = villagers.pop();
                            announcement += villagers.map(villager => villager.name).join(", ") + ", and " + lastVillager.name + " are celebrating their birthdays today!";
                        }
                        channel.send(announcement);
                    }
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