// Bring Mongoose into the app
var mongoose = require('mongoose');
var config = require('../config');
var mongoURI = config.db.url.morpheus;
var contingError = 0;

module.exports = connectionDB = mongoose.createConnection(mongoURI);

connectionDB.on('connected', function() {
    contingError = 0;
    console.log('Mongoose connected to connection mercury');
});

// If the connection throws an error
connectionDB.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err + mongoURI);
});

// When the connection is disconnected
connectionDB.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
    if (contingError < 5) {
        module.exports = connectionDB = mongoose.createConnection(mongoURI);
    }
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    connectionDB.close(function() {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

require('./emailQueue');