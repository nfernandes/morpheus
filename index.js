'use strict';

//Variables
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sessiondb = require('connect-mongo')(session);
var flash = require('connect-flash');
var mongoose = require('mongoose');
var path = require('path');
var config = require("./backend/config");

// trying AWS-X-RAY
//var AWSXRay = require('aws-xray-sdk');

/*---------------------- APP INCLUDES --------------------- */
var db = require('./backend/models/connectionMorpheus');
var querystring = require('querystring');
var routes = require('./backend/routes');

/*---------------------- INITIALIZE APP --------------------- */
var app = express();
console.log('Bootstrapping Morpheus');


/*---------------------- AWS X-RAY ------------- */
//app.use(AWSXRay.express.openSegment());

/*---------------------- ERRORS -------------- */

app.use(function(req, res, next) {
    var err = null;
    try {
        decodeURIComponent(req.path)
    } catch (e) {
        err = e;
    }
    if (err) return response.sendError(res, 404, 'Malformed URI');
    next();
});


/*---------------------- Middleware --------------------- */

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.text({ limit: '50mb' }));

app.use(function(req, res, next) {
    try {
        req.body = JSON.parse(req.body);
    } catch (err) {
        console.log("request is application json");
    }

    if (req.query.filter && req.query.filter.indexOf("+") != -1) {
        req.query.filter = req.query.filter.replace("+", "\\+");
    }

    req.request = {
        api: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
        params: req.params,
        remoteHost: req.connection.remoteAddress,
        requestedAt: new Date()
    }
    next();
});

//type of the results have to be json
app.use('*', function(req, res, next) {
    res.set('Content-Type', 'application/json');
    next();
});

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //todo put right port
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

/*---------------------- MOUNT ROUTES ------------- */
app.use('/', routes);

/*---------------------- SESSIONS --------------------- */
app.use(cookieParser());
app.use(session({
    store: new sessiondb({ mongooseConnection: mongoose.connection }),
    secret: config.session.secret,
    proxy: 'true',
    resave: 'false',
    saveUninitialized: 'false'
}));

app.use(flash());

var server = app.listen(config.http.port, function() {
    var address = server.address();
});