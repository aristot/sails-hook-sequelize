# sails-hook-sequeliz
Sails.js V1.4 hook to use Sequelize ORM V6



# Installation

Install this hook with:

```sh
$ npm install sails-hook-sequeliz --save
```

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

## Connections

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

## Models

Sequelize model definition `models/user.js`

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
    connection: 'NotDefaultModelsConnection'    // Can be omitted, so default sails.config.models.connection will be used
  }
};
```
Modified by Raymond FEST 2021
to work with Sails ^V1.4.4 new version applications
Sequelize ^V6.6
MsSqlServer 2019 express
# Contributors
This project was originally created by Gergely Munkácsy (@festo).
Now is maintained by Konstantin Burkalev (@KSDaemon).

# License
[MIT](./LICENSE)
[github-url]: https://github.com/aristot/sails-hook-sequeliz.git

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT
