describe('Sails.js Sequelize hook test suite', () => {

    const decache = require('decache');

    let clean = () => {
        decache('./unit/create.test');
        decache('./unit/associations.test');
        decache('./unit/scope.test');
    };


    require('./bootstrap.v1.0.test');
    clean();
});
