'user strict';

var jwt = require('jsonwebtoken');
var config = require('../config');
var Promise = require("bluebird");
var response = require("../utils/response");

module.exports = {
    decode: function(req) {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer') == -1) {
            return response.sendError(res, 401);
        }
        req.accessToken = req.headers.authorization.split('Bearer ')[1];
        try {
            // since we are using JWT we can also get user role directly from the token
            var decoded;
            try {
                decoded = jwt.verify(req.accessToken, config.jwt.secret);
            } catch (err) {
                console.log("jwt-err", err);
                return response.sendError(res, 401);
            }
            //req.role = decoded.role; //todo put this in the token
            return decoded;

        } catch (err) { 
            console.log("jwt-err", err);
            return;
        }
    }
}