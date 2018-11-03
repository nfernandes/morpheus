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
            status: errorCode,
            error: msg
        }
        res.status(errorCode).send(strErr);
    }
}