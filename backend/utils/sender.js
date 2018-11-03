'use strict';

var config = require('../config'),
    _ = require('lodash'),
    nodemailer = require('nodemailer'),
    EmailQueue = require("../models/connectionMercury").model('emailQueue');

var jwt = require('jsonwebtoken');
var request = require('request');
var http = require("http");
var https = require("https");

function createJWT() {
    try {
        return jwt.sign({
                client: "mercuryClient"
            },
            config.jwt.secret);
    } catch (e) {
        log.info("notification-jwt" + e);
        return "";
    }
}

var exports = module.exports = {
    sendWithNodemailer: function(emailToSend) {
        return new Promise(function(resolve, reject) {

            var configTransporter = {
                host: config.email.nodemailer.host,
                port: config.email.nodemailer.port,
                auth: {
                    user: config.email.nodemailer.user,
                    pass: config.email.nodemailer.password,
                },
                logger: true
            };

            var smtpTransport = nodemailer.createTransport(configTransporter);
            var fromEmail = emailToSend.from;

            log.info("sendWithNodemailer" + JSON.stringify({
                from: fromEmail,
                to: emailToSend.toEmails,
                cc: emailToSend.ccEmails,
                bcc: emailToSend.bccEmails
            }));

            var mailOptions = {
                from: fromEmail,
                to: emailToSend.toEmails,
                cc: emailToSend.ccEmails,
                bcc: emailToSend.bccEmails,
                replyTo: emailToSend.replyToEmails,
                subject: emailToSend.notification.subject.replace("/n", ""),
                text: emailToSend.notification.text,
                html: emailToSend.notification.html
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    log.error("sendWithNodemailer err " + err);
                    reject(err);
                } else {
                    smtpTransport.close();
                    resolve(emailToSend);
                }
            });
        }).catch(function(err) {
            log.error("sendWithNodemailer err " + err);
            reject(err)
        });


    }
}