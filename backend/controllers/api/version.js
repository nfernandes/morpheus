'use strict';

var pack = require("../../../package.json");

module.exports = {
    version: function(req, res) {
        res.send({ data: { version: pack.version } });
    }

}