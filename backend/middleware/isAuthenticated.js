'use strict';

var jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    response = require('../utils/response.js'),
    config = require('../config');

module.exports = function(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer') == -1) {
        return response.sendError(res, 401);
    }
    req.accessToken = req.query.access_token ? req.query.access_token : req.headers.authorization.split('Bearer ')[1];

    var decoded;
    try {
        decoded = jwt.verify(req.accessToken, config.jwt.secret);
        return next();
    } catch (err) {

        return response.sendError(res, 401);
    }
};