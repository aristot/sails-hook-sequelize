# sails-hook-sequeliz
Sails.js V1.4 hook to use sequelize ORM V5



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

```
module.exports.sequelize = {
    "clsNamespace": "myAppCLSNamespace",
    "exposeToGlobal": true
};
```

## Connections

Sequelize connection

```javascript
somePostgresqlServer: {
  user: 'postgres',
  password: '',
  database: 'sequelize',
  dialect: 'postgres',
  options: {
    dialect: 'postgres',
    host   : 'localhost',
    port   : 5432,
    logging: console.log        // or specify sails log level to use ('info', 'warn', 'verbose', etc)
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
Modified by Raymond FEST
to match with Sails V0.12 old version applications
# Contributors
This project was originally created by Gergely Munkácsy (@festo).
Now is maintained by Konstantin Burkalev (@KSDaemon).

# License
[MIT](./LICENSE)
[github-url]: https://github.com/aristot/sails-hook-sequeliz.git

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT
