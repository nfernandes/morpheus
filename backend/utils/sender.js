'use strict';

var config = require('../config'),
    _ = require('lodash'),
    nodemailer = require('nodemailer'),
    EmailQueue = require("../models/connectionMorpheus").model('emailQueue'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    http = require("http"),
    https = require("https");


var exports = module.exports = {
    sendWithNodemailer: function(emailToSend) {
        return new Promise(function(resolve, reject) {

            var configTransporter = {
                host: config.email.nodemailer.host,
                port: config.email.nodemailer.port,
                auth: {
                    user: config.email.nodemailer.auth.user,
                    pass: config.email.nodemailer.auth.pass,
                },
                logger: true
            };

            var smtpTransport = nodemailer.createTransport(configTransporter);

            var mailOptions = {
                from: emailToSend.from,
                to: emailToSend.to,
                subject: emailToSend.subject,
                text: emailToSend.text,
                html: emailToSend.html
            };
            console.log(mailOptions);

            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    console.log("sendWithNodemailer err " + err);
                    reject(err);
                } else {
                    smtpTransport.close();
                    console.log("email sent")
                    resolve(emailToSend);
                }
            });
        }).catch(function(err) {
            log.error("sendWithNodemailer err " + err);
            reject(err)
        });


    }
}