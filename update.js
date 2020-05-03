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
                    if(json.villager && json.villager.length > 0)
                    {
                        let announcement;
                        if(json.villager.length == 1)
                        {
                            announcement = "Today ";
                            announcement += json.villager[0].name;
                            announcement += " is celebrating ";
                            announcement += genderify(json.villager);
                            announcement += " birthday!";
                        }
                        else
                        {
                            lastVillager = json.villager.pop();
                            announcement += json.villager.map(villager => villager.name).join(", ") + ". and " + lastVillager.name + " are celebrating their birthdays!";
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