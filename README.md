# sails-hook-sequeliz
Sails.js V1.4 hook to use Sequelize ORM V6
New version adding automatic datadbase settup for sqlserver (experimental)


# Loading (take care not sure you will have access to the last version due to problems with npm publish)

Install this hook with:

```sh
$ npm install sails-hook-sequeliz --save
```

# installation through  package.json better solution add :

`"sails-hook-sequelize": "git://github.com/aristot/sails-hook-sequeliz",`

# Configuration

`.sailsrc`

```
{
  "hooks": {
    "orm": false,
    "pubsub": false
  }
}
```

Also you can set some parameters in `config/sequelize.js` to override defaults.

```javascript
module.exports.sequelize = {
    "clsNamespace": "sails-sequelize",
    "exposeToGlobal": true
};
```

## Connections when data base exist in config/datastores.js

Sequelize connection with sqlserver 2019 Express

```javascript
asqlserver: {
    dialect: 'mssql',
    username: 'YourUserName',
    password: 'YourPassword',
    server   : 'localhost',
    options : {
        dialect: 'mssql',
        host   : 'localhost',
        port   : 1433,
        username: 'YourUserName',
        password: 'YourPassword',
        database: 'YourDBName',
        encrypt: false,
        logging:false
    }
}
```
## Connections with automatic database setting in config/datastores.js
Insert a new promise function "preProcess" at same level as stores.
(limitation)
Only One connection from datastores is supported (the first avalaible)

Exemple of implementation

```javascript
 const config = require('./config.js');
 const async = require('async');
 const Sequelize = require('sequelize');
 console.log('Connection to SQL DataBase: ' + config.BaseSQLName);

 console.log('Loading... ', __filename);
 const OsPlatform = process.platform;
 let connections;
 ...
 const connectionsWinDev = {

   /***************************************************************************
   *                                                                          *
   * Local disk storage for DEVELOPMENT ONLY                                  *
   *                                                                          *
   * Installed by default.                                                    *
   *                                                                          *
   ***************************************************************************/
   memory: {
     adapter: 'sails-disk',
     inMemory: true
   },

   test: {
     adapter: 'sails-disk'
   },

   local: {
     adapter: 'sails-disk'
   },
   /**
    * Preloader permits to settup automatically user database in sqlserver
    * During elevation of Sequelize Hook preloader will be called to execute :
    *  1) create a connection and log under system database (i.e. master )
    *  2) check if user database exist
    *     if not create database
    *      associate owner
    *  3) check if broker is enabled
    *     if not       broker is  enabled
    *  4) finally close this connection.
    *
    * @param {*} connection
    * {
        dialect: 'mssql',
        username: 'sa',
        password: 'userpass',
        server: 'localhost',
        options: {
          dialect: 'mssql',
          host: 'localhost',
          port: 1433,
          username: 'sa',
          password: 'userpass',
          database: 'userdatabase',
          encrypt: false,
          logging: false,
          preload: {
            database: 'master',
            username: 'sa',
            password: 'sapass'
          }
        }
      }
    */
   preProcess : function(connection){
    return new Promise( (resolve,reject)=>{
        sails.log.silly('Preload database function :', connection);
        const opt = Object.assign({},connection.options);
        const preloadUser = opt.preload.username;
        const preloadDb = opt.preload.database;
        const preloadPass = opt.preload.password;
        const dbName= opt.database;
        opt.username = preloadUser;
        opt.password = preloadPass;
        opt.database = preloadDb;
        delete opt.preload;
        let toCreate = false;
        let isBroker = false;
        let safe = false;
        let steps = [];
        const preload = new Sequelize(preloadDb,
            preloadUser,
            preloadPass,
            opt);
        sails.log.silly('Preload database connected :', opt, preloadDb, dbName);

        steps.push(
            (cb)=>{
                return preload.query('SELECT name FROM master.sys.databases WHERE name = N\'' + dbName + '\'' ).then((exists)=>{
                    sails.log.silly('Data base checking :', exists);
                    if(exists && exists.length  && exists[0].length){
                        let db = exists[0][0].name;
                        sails.log.silly('Data base exists[0][0] :', exists[0][0], db, dbName);
                        toCreate = db  && db !== dbName;
                    } else toCreate = true;

                    return cb();
                }).catch((err)=>{
                    return cb(err);
                });
            }
        );
        steps.push(
            (cb)=>{
                if(toCreate){
                    sails.log.silly('Data base to create');
                        preload.query('CREATE DATABASE ' + dbName  ).then(()=>{
                            preload.query('ALTER AUTHORIZATION ON DATABASE::' + dbName +' TO sa').then((v)=>{
                                sails.log.silly('Data base created :', v);
                                safe = true;
                                cb();
                            });
                    }).catch((err) =>{
                        cb(err);
                    });
                } else {
                    cb();
                }
            }
        );
        steps.push(
            (cb) => {
                preload.query('SELECT is_broker_enabled FROM sys.databases WHERE name = N\'' + dbName + '\'' ).then((broker) =>{
                    if(broker && broker.length){
                        sails.log.silly('Broker enabled :', broker[0]);
                        let enabled = broker[0];
                        if(enabled && enabled.length){
                            isBroker = enabled[0].is_broker_enabled;
                            sails.log.silly('Broker enabled :', isBroker);
                        }
                    }
                    cb();
                }).catch((err) =>{
                    cb(err);
                });
            }
        );
        steps.push(
            (cb) => {
                    if(!isBroker){
                        preload.query('ALTER DATABASE ' + dbName + ' SET ENABLE_BROKER WITH ROLLBACK IMMEDIATE' ).then(()=>{
                            cb();
                        }).catch((err) =>{
                            cb(err);
                        });
                    } else {
                        cb();
                    }
                }
        );
        async.series(steps, (err) =>{
            preload.close();
            if (err) reject(err);
            resolve(safe);
        });
    });

   },
    /* sequelize connection parameters
    */
   sqlserver: {
     dialect: 'mssql',
     username: 'username',
     password: 'userpass',
     server   : 'localhost',
     options : {
        dialect: 'mssql',
        host   : 'localhost',
        port   : 1433,
        username: 'username',
        password: 'userpass',
        database: 'userdb',
        encrypt: false,
        logging:false,
        preload: {
          database: 'master',
          username: 'sa',
          password: 'sapass'
        }
      }
   }


   ...

};
if (OsPlatform === 'darwin'){
    connections = connectionsDarwin;
} else {
   if(process.env.NODE_ENV === 'development'){
     connections = connectionsWinDev;
   } else {
     connections = connectionsWinProd;

   }
}
module.exports.connections = connections;

```
## Models

Sequelize model definition `models/user.js`
Imperative: the options directive is mandatory in this release. It could be reduced to an empty object {}
```javascript
module.exports = {
  attributes: {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    age: {
      type: Sequelize.INTEGER
    }
  },
  associations: function() {
    user.hasMany(image, {
      foreignKey: {
        name: 'owner',
        allowNull: false
      }
    });
  },
  defaultScope: function() {
    return {
      include: [
        {model: image, as: 'images'}
      ]
    }
  },
  options: {
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }
};
```
Modified by Raymond FEST 2021
to work with Sails ^V1.5.0 new version applications
Sequelize ^V6.6
MsSqlServer 2019 express
# Contributors
This project was originally created by Gergely Munkácsy (@festo).


# License
[MIT](./LICENSE)
[github-url]: https://github.com/aristot/sails-hook-sequeliz.git

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT
