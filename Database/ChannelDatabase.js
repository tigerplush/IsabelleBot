const Database = require('./Database.js');

class ChannelDatabase extends Database
{
    constructor(pathToDatabase, databasefilename)
    {
        super(pathToDatabase, databasefilename);
    }

    addChannel(serverid, channelid, type)
    {
        const channel = {serverid: serverid, channelid: channelid, type: type};
        return new Promise((resolve, reject) => 
        {
            super.find(channel)
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        //this channel is already added for the same type
                        reject();
                    }
                    else
                    {
                        //this channel is not initialised
                        super.add(channel)
                        .then(() => resolve())
                        .catch(err => reject(err));
                    }
                })
            .catch(err => reject(err));
        })
    }

    removeChannel(serverid, channelid)
    {
        super.remove({serverid: serverid, channelid: channelid});
    }

    fetchChannels(channelManager, channel)
    {
        return new Promise((resolve, reject) =>
        {
            super.find(channel)
            .then(docs =>
                {
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
                })
            .catch(err => reject(err));
        });
    }

    fetchChannel(channelManager, channel)
    {
        return new Promise((resolve, reject) =>
        {
            this.fetchChannels(channelManager, channel)
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0]);
                    }
                    reject(`404 - channel ${JSON.stringify(channel)} not found`);
                })
            .catch(err => reject(err));
        });
    }

    findChannel(serverid, type)
    {
        return new Promise((resolve, reject) =>
        {
            super.find({serverid: serverid, type: type})
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0]);
                    }
                    reject(`404 - channel of type ${type} on server ${serverid} not found`);
                })
            .catch(err => reject(err));
        });
    }

    updateTimestamp(serverid)
    {
        super.update(
            {serverid: serverid},
            {lastMessageTimestamp: Date.now()})
            .catch(err => console.log(err));
    }

    fetchAnnouncementChannels(channelManager)
    {
        return this.fetchChannels(channelManager, {type: "announcement"});
    }
}

module.exports = ChannelDatabase;