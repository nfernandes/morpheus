'use strict';

var mongoose = require('mongoose');
var config = require("../../config");
var Email = require("../../models/connectionMorpheus.js").model('emailQueue');
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
    console.log(req.params.to);
    Email.find({ to: req.params.to }, function(err, emails) {
        if (err) return response.sendError(res, 404, "data not found");
        if (!emails.length) return response.sendData(res, [], {}, 'no email');
        return response.sendData(res, emails, {});

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
    var email = new Email();
    email.from = req.body.from; //? validateEmail(req.body.from) : null,
    email.subject = req.body.subject;
    email.text = req.body.text;
    email.html = req.body.html;
    email.to = req.body.to;

    if (!email.from && req.body.from)
        response.sendError(res, 400, 'invalid from email(s)');
    else if (!email.to && req.body.to)
        response.sendError(res, 400, 'invalid to email(s)');
    else {
        email.save(function(err, savedEmail) {
            //send email
            //send email and save as processes
            sender.sendWithNodemailer(email)
                .then(function(email) {
                    email.isProcessed = true;
                    email.save(function(err, savedEmail) {
                        response.sendData(res, savedEmail, { list: true });
                    });
                })
                .catch(function(err) {
                    response.sendError(res, 400, 'Email not sent' + err);
                });

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