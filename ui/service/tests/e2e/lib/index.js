const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes');

dotenv.config({
    path: path.join(__dirname, '../../.env')
});


const host =
    process.env.PORT
        ? `localhost:${process.env.PORT}`
        : 'localhost:5001';

module.exports = {
    host,
    routes
};