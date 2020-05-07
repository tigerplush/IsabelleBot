const Database = require('./Database.js');

class ChannelDatabase extends Database
{
    constructor(pathToDatabase, databasefilename)
    {
        super(pathToDatabase, databasefilename);
    }

    addOrUpdate(serverid, welcomingMessage)
    {
        return new Promise((resolve, reject) =>
        {
            super.find({serverid: serverid})
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        //there is a message, update
                        super.update({serverid: serverid}, {welcomingMessage: welcomingMessage})
                        .then(() => resolve())
                        .catch(err => console.log(err));
                    }
                    else
                    {
                        super.add({serverid: serverid, welcomingMessage: welcomingMessage})
                        .then(() => resolve())
                        .catch(err => console.log(err));
                    }
                })
            .catch(err => reject(err));
        });
    }

    findMessage(serverid)
    {
        return new Promise((resolve, reject) =>
        {
            super.find({serverid: serverid})
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0].welcomeMessage);
                    }
                    reject(`404 - welcoming message for server ${serverid} not found`);
                })
            .catch(err => console.log(err));
        })
    }
}

module.exports = ChannelDatabase;