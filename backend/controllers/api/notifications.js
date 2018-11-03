'use strict';

var mongoose = require('mongoose');
var config = require("../../config");
var Notification = require("../../models/connectionMorpheus.js").model('notificationQueue');
var response = require('../../utils/response.js');
var sender = require("../../utils/sender.js");
var _ = require('lodash');
var JWT = require("../../utils/jwt.js");
var _ = require("lodash");
var validator = require('validator');

function list(req, res) {
    var query = {};
    var options = { sort: { 'createdAt': -1 } };

    if (req.query.to) query.to = req.query.to;
    if (req.query.from) query.to = req.query.from;
    if (req.query.page) options.page = parseInt(req.query.page);
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    console.log("query " + JSON.stringify(query));

    //count bases in query filter also
    Notifications.count(query, function(err1, nr) {
        if (err1) return response.sendError(res, 400, "invalid data");

        if (!req.query.limit) options.limit = nr;
        Notifications.paginate(query, options, function(err, notification) {
            if (err) return response.sendError(res, 400, "invalid data");

            if (notification) {
                response.sendData(res, notification.docs, { list: true, size: nr });
            } else
                return response.sendData(res, [], {}, 'no notification');
        });
    });
}

function details(req, res) {
    console.log(req.params.to);
    Notifications.find({ to: req.params.to }, function(err, notifications) {
        if (err) return response.sendError(res, 404, "data not found");
        if (!notifications.length) return response.sendData(res, [], {}, 'no notifications');
        return response.sendData(res, notifications, {});

    });
}

function validateEmail(emails) {
    var validatedEmails = [];

    if (emails instanceof Array) {
        if (emails.length == 0) return [];
        validatedEmails = emails;
    } else {
        validatedEmails = emails.split(',');
    }

    var isValid = true;
    _.each(validatedEmails, function(e) {
        if (!checkEmail(e, 'email'))
            isValid = false;
    });
    if (!isValid)
        return [];
    else
        return validatedEmails;

}



function create(req, res) {
    var notification = new Notification();
    notification.from = req.body.from; //? validateEmail(req.body.from) : null,
    notification.subject = req.body.subject;
    notification.text = req.body.text;
    notification.html = req.body.html;
    notification.to = req.body.to;
    notification.toNumber = req.body.toNumber;
    notification.fromNumber = req.body.fromNumber;

    if (!notification.from && req.body.from)
        response.sendError(res, 400, 'invalid from email(s)');
    else if (!notification.to && req.body.to)
        response.sendError(res, 400, 'invalid to email(s)');
    else {
        notification.save(function(err, savedNotification) {
            //send notification
            //send notification and save as processes
            sender.sendWithNodemailer(notification)
                .then(function(notification) {
                    notification.isProcessed = true;
                    notification.save(function(err, savedNotification) {
                        response.sendData(res, savedNotification, { list: true });
                    });
                })
                .catch(function(err) {
                    response.sendError(res, 400, 'Notification not sent' + err);
                });
            //code to send sms   
            /*sender.sendSMS(notification)
                .then(function(notification) {
                    notification.isProcessed = true;
                    notification.save(function(err, savedNotification) {
                        response.sendData(res, savedNotification, { list: true });
                    });
                })
                .catch(function(err) {
                    response.sendError(res, 400, 'Notification not sent' + err);
                });*/

        })

    }
}

function checkEmail(email) {
    var newEmail = validator.trim(email);
    if (validator.isEmail(newEmail, { allow_display_name: true }))
        return newEmail;
    else
        return null;
}

module.exports = {
    list: list,
    create: create
}