const Database = require('./Database.js');

class UserDatabase extends Database
{
    constructor(pathToDatabase, databasefilename)
    {
        super(pathToDatabase, databasefilename);
    }

    addOrUpdate(serverid, userid, birthday)
    {
        const user = {serverid: serverid, userid: userid};
        return new Promise((resolve, reject) =>
        {
            super.find(user)
            .then(users =>
                {
                    if(users && users.length > 0)
                    {
                        super.update(user, {birthday: birthday})
                        .then(() => resolve())
                        .catch(err => reject(err));
                    }
                    else
                    {
                        user.birthday = birthday;
                        super.add(user)
                        .then(() => resolve())
                        .catch(err => reject(err));
                    }
                })
            .catch(err => reject(err));
        });
    }

    findUser(serverid, userid)
    {
        return new Promise((resolve, reject) =>
        {
            super.find({serverid: serverid, userid: userid})
            .then(users =>
                {
                    if(users && users.length > 0)
                    {
                        resolve(users[0]);
                    }
                    reject(`404 - user ${userid} on server ${serverid} not found`);
                })
            .catch(err => reject(err));

        });
        
    }
}

module.exports = UserDatabase;