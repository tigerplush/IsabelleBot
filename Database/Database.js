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

    add(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.insert(doc, function(err)
            {
                if(err)
                {
                    reject(err);
                }
                resolve();
            })
        });
    }

    update(doc, updateProperties)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.update(
                doc,
                {$set: updateProperties},
                {},
                function(err)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    resolve();
                });
        });
    }

    remove(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.remove(doc, function(err)
            {
                if(err)
                {
                    reject(err);
                }
                resolve();
            })
        });
    }

    find(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.find(doc, function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }
}

module.exports = Database;