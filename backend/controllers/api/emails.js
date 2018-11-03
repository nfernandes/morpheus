'use strict';

var mongoose = require('mongoose');
var config = require("../../config");
var Email = require("../../models/connectionMorpheus.js").model('emailQueue');
var response = require('../../utils/response.js');
var sender = require("../../utils/sender.js");
var _ = require('lodash');
var mercuryJWT = require("../../utils/jwt.js");
var _ = require("lodash");
var validator = require('validator');

function list(req, res) {
    var query = { isDeleted: { $ne: true } };
    var options = { sort: { 'createdAt': -1 } };
    var queryFilter = {};

    if (req.query.filter) {
        queryFilter = {
            $and: [ //{ subject: { $ne: null } },
                {
                    $or: [
                        { 'from': { '$regex': req.query.filter, $options: '-i' } },
                        { 'to': { '$regex': req.query.filter, $options: '-i' } },
                        { 'subject': { '$regex': req.query.filter, $options: '-i' } }
                    ]
                }
            ]
        };
    }

    query = {
        $and: [
            { subject: { $ne: null } },
            queryFilter
        ]
    }

    if (req.query.createdAt) options.sort = { createdAt: parseInt(req.query.createdAt) };
    if (req.query.updatedAt) options.sort = { updatedAt: parseInt(req.query.updatedAt) };

    if (req.query.from) options.sort = { from: parseInt(req.query.from) };
    if (req.query.to) options.sort = { to: parseInt(req.query.to) };
    if (req.query.subject) options.sort = { subject: parseInt(req.query.subject) };
    if (req.query.page) options.page = parseInt(req.query.page);
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    console.log("email_query " + JSON.stringify(query));

    //count bases in query filter also
    Email.count(query, function(err1, nr) {
        if (err1) return response.sendError(res, 400, "invalid data");

        if (!req.query.limit) options.limit = nr;
        Email.paginate(query, options, function(err, email) {
            if (err) return response.sendError(res, 400, "invalid data");

            if (email) {
                response.sendData(res, email.docs, { list: true, size: nr });
            } else
                return response.sendData(res, [], {}, 'no email');
        });
    });
}

function details(req, res) {
    Email.findById(req.params.emailid, function(err, email) {
        var domain = mercuryJWT.decode(req).domain;

        if (err) return response.sendError(res, 404, "data not found");
        if (!email) return response.sendData(res, [], {}, 'no email');
        return response.sendData(res, email, {});

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
        if (!validator.validate(e, 'email'))
            isValid = false;
    });
    if (!isValid)
        return [];
    else
        return validatedEmails;

}



function create(req, res) {
    var email = {
            from: req.body.from ? validateEmail(req.body.from) : null,
            fromName: req.body.fromName,
            extra: req.body.extra ? req.body.extra : {},
            to: req.body.to ? validateEmail(req.body.to) : [],
            cc: req.body.cc ? validateEmail(req.body.cc) : [],
            bcc: req.body.bcc ? validateEmail(req.body.bcc) : [],
            replyto: validateEmail(req.body.replyto, 'email'),
            attachment: req.body.attachment,
            attachmentFileName: req.body.attachmentFileName
        }
        //log.info("email obj " + JSON.stringify(notObject));

    if (!notObject.from && req.body.from)
        response.sendError(res, 400, 'invalid from email(s)');
    else if (!notObject.to && req.body.to)
        response.sendError(res, 400, 'invalid to email(s)');
    else {
        //send email
        //send email and save as processes
        sender.sendWithNodemailer(email)
            .then(function(email) {
                response.sendData(email);
            })
            .catch(function(err) {
                email.isProcessed = false;

            });

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
    details: details,
    create: create
}