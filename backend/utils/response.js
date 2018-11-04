/**
 * standardized responses for the apis
 * 
 * keeping the same structure in case of success and errors
 * 
 * in terms of error and status data.
 * 
 */

var errors = require('../constants/errors');

module.exports = {
    sendData: function(res, data, flags, status) {
        res.send({
            data: data,
            flags: flags ? flags : {},
            status: status ? status : 200,
            error: null
        });
    },
    sendError: function(res, errorCode, message) {
        var msg = '';
        if (message) msg = message;
        else if (errors["ERR_" + errorCode]) {
            msg = errors["ERR_" + errorCode][1];
        }
        var strErr = {
            status: errorCode,
            error: msg
        }
        res.status(errorCode).send(strErr);
    }
}