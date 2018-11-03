'use strict';

var config = require('../config'),
    _ = require('lodash'),
    nodemailer = require('nodemailer'),
    notificationQueue = require("../models/connectionMorpheus").model('notificationQueue'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    http = require("http"),
    https = require("https"),
    puretext = require('puretext');


var exports = module.exports = {
    sendWithNodemailer: function(emailToSend) {
        return new Promise(function(resolve, reject) {

            var configTransporter = {
                service: config.email.nodemailer.type,
                auth: {
                    user: config.email.nodemailer.auth.user,
                    pass: config.email.nodemailer.auth.pass,
                }
            };
            console.log(configTransporter)

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
            console.log("sendWithNodemailer err " + err);
            reject(err)
        });


    },
    sendSMS: function(messageToSend) {
        return new Promise(function(resolve, reject) {
            var text = {
                toNumber: messageToSend.toNumber,
                fromNumber: config.sms.defaultFromNumber,
                smsBody: messageToSend.text,
                apiToken: config.sms.token
            };

            puretext.send(text, function(err, response) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(response);
                    resolve();
                }
            })
        });
    }
}