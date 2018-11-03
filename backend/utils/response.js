var errors = require('../constants/errors');

module.exports = {
    sendData: function(res, data, flags, status) {
        res.send({
            data: data,
            flags: flags ? flags : {},
            status: status ? status : null,
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
            status: null,
            error: {
                code: errors["ERR_" + errorCode],
                message: msg
            }
        }
        res.status(errorCode).send(strErr);
    },
    sendErrorApi: function(res, errorCode, message) {
        var msg = message ? message : (errors["ERR_" + errorCode] ? errors["ERR_" + errorCode][1] : '');

        if (!errorCode) errorCode = 500;
        res.status(errorCode).send({
            error: {
                code: errors["ERR_" + errorCode],
                message: msg
            },
            system: res.system || 'Morpheus',
            data: null,
            status: null
        });
    }
}