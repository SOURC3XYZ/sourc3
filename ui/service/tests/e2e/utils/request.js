const req = require('request');
const { host } = require('../lib/index');

function request(path, obj, method) {
    return new Promise((resolve, reject) => {
        req(
            `http://${host}${path}`,
            {
                json: obj,
                method: method || 'POST'
            },

            (error, _info, body) => {
                if (error) reject(error);
                resolve(body);
            }
        );
    });
}


module.exports = {
    request
}
