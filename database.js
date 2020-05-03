const fs = require('fs');
const path = require('path');
const Datastore = require('nedb');

class Database
{
    constructor(pathToDatabase, databasefilename)
    {
        if(!fs.existsSync(pathToDatabase))
        {
            fs.mkdirSync(pathToDatabase);
        }
        this.database = new Datastore(path.join(pathToDatabase, databasefilename));
        this.database.loadDatabase();
    }

    addChannel(channelid)
    {
        return new Promise((resolve, reject) => 
        {
            this.database.find({}, (err, docs) =>
            {
                if(err)
                {
                    reject(err);
                }
                if(docs && docs.length > 0)
                {
                    reject();
                }
                else
                {
                    this.database.insert({channelid: channelid});
                    resolve();
                }
            });
        })
    }

    removeChannel(channelid)
    {
        this.database.remove({channelid: channelid});
    }

    fetchChannels(channelManager)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.find({}, function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                if(docs && docs.length >= 0)
                {
                    const channelPromises = docs.map(channel => channelManager.fetch(channel.channelid));
                    Promise.all(channelPromises)
                    .then(channels =>
                        {
                            resolve(channels);
                        })
                    .catch(err => reject(err));
                }
                else
                {
                    reject();
                }
            });
        });
    }
}

module.exports = 
{
    Database: Database
}