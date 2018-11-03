'use strict';

var mongoose = require('mongoose');
var content = require('../../constants/content/content-en.js');
var config = require("../../config");
var validator = require('../../utils/validator.js');
var EmailTemplate = require("../../models/connectionMercury.js").model('emailTemplate');
var Email = require("../../models/connectionMercury.js").model('emailQueue');
var Smtp = require("../../models/connectionMercury.js").model('smtp');
var User = require("../../models/connectionUser.js").model('user');
var response = require('../../utils/response.js');
var utils = require('../../utils/resultsFormatter.js');
var _ = require('lodash');
var mercuryJWT = require("../../utils/jwt.js");
var Smtp = require("../../models/connectionMercury.js").model('smtp');
var Configuration = require("../../models/connectionMercury.js").model('configuration');
var Preferences = require("../../models/connectionMercury.js").model('preference');
var notificationSender = require("../../utils/notificationSender.js");

function list(req, res) {
    var query = {};
    var options = { sort: { 'subject': 1 } };

    if (req.query.page) options.page = parseInt(req.query.page);
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    var decodedMercuryRequest = mercuryJWT.decode(req);
    var requestDomain = decodedMercuryRequest ? decodedMercuryRequest.domain : null;

    if (requestDomain == "itpx" && req.query.domain)
        requestDomain = req.query.domain; //in case we request a specific domain for some reason

    if (requestDomain != "itpx") {
        query = {
            $or: [
                { domain: requestDomain },
                { domain: null },
            ]
        };
    }

    if (req.query.typeId) {
        query.typeId = req.query.typeId;
    }

    if (req.query.strictDomain) {
        query.domain = requestDomain;
    }

    var chunkQuery = {};
    if (req.query.isChunked) {
        chunkQuery = { 'isChunked': req.query.isChunked };
        query = {
            $and: [
                query,
                chunkQuery
            ]
        };
    }

    if (req.query.filter) {
        query = {
            $and: [
                query,
                chunkQuery,
                {
                    $or: [
                        //{ 'from': { '$regex': req.query.filter, $options: '-i' } },
                        //{ 'to': { '$regex': req.query.filter, $options: '-i' } },
                        { 'key': { '$regex': req.query.filter, $options: '-i' } },
                        { 'subject': { '$regex': req.query.filter, $options: '-i' } },
                        //{ 'text': { '$regex': req.query.filter, $options: '-i' } },
                        //{ 'html': { '$regex': req.query.filter, $options: '-i' } },
                        { 'label': { '$regex': req.query.filter, $options: '-i' } },
                        { 'typeId': { '$regex': req.query.filter, $options: '-i' } }
                    ]
                }
            ]
        }

    }
    if (req.query.group) {
        query.notificationGroup = req.query.group;
    }

    if (req.query.createdAt) options.sort.createdAt = { createdAt: parseInt(req.query.createdAt) };
    if (req.query.subject) options.sort = { subject: parseInt(req.query.subject) };
    if (req.query.key) options.sort = { key: parseInt(req.query.key) };

    req.log.info("template-query:" + JSON.stringify(query));
    console.log(JSON.stringify(query));
    //req.log.info("list-templates", query);
    //count bases in query filter also
    EmailTemplate.count(query, function(err1, nr) {
        if (!req.query.limit) options.limit = nr;
        EmailTemplate.paginate(query, options, function(err, email) {
            if (err) return validator.error(req, res, err, 'read');

            if (email) {
                email = utils.emailTemplate.formatGroup(email.docs);
                response.sendData(res, email, { list: true, size: nr });
            } else
                return response.sendData(res, [], {}, 'no email');
        });
    });
}

function dictionaryList(req, res) {
    var query = {};

    if (req.query.group) query.notificationGroup = req.query.group;

    if (req.query.filter) query.key = { '$regex': req.query.filter, $options: '-i' };

    req.log.info("template-query:" + JSON.stringify(query));
    console.log(JSON.stringify(query));
    //req.log.info("list-templates", query);
    //count bases in query filter also
    EmailTemplate.find(query, function(err, templates) {

        if (err) return validator.error(req, res, err, 'read');

        if (templates) {
            response.sendData(res, _.map(templates, function(elem) {
                return { key: elem.key, value: elem.key };
            }), { list: true });
        } else
            return response.sendData(res, [], {}, 'no templates');
    });
}

function domainTemplateList(req, res) {
    var query = {};
    var decodedMercuryRequest = mercuryJWT.decode(req);
    var requestDomain = decodedMercuryRequest ? decodedMercuryRequest.domain : null;

    if (!req.body.defaultTemplate) {
        return response.sendError(res, 500, "defaultTemplate is missing");
    }

    if (req.body.isChunked == null) {
        query = {
            $and: [
                { domain: requestDomain },
                { defaultTemplate: req.body.defaultTemplate }
            ]
        }
    } else {
        query = {
            $and: [
                { domain: requestDomain },
                { defaultTemplate: req.body.defaultTemplate },
                { isChunked: req.body.isChunked }
            ]
        }
    }

    req.log.info("template-query:" + JSON.stringify(query));
    console.log(JSON.stringify(query));

    EmailTemplate.find(query, function(err, templates) {
        if (templates.length == 0) return response.sendData(res, [], {}, 'no email templates');
        if (err) return validator.error(req, res, err, 'read');
        return response.sendData(res, templates, {});
    });
}

function details(req, res) {
    var domain = mercuryJWT.decode(req).domain;

    EmailTemplate.findById(req.params.templateid, function(err, email) {
        Preferences.findOne({ preferenceKey: email.notificationGroup }, function(err, pref) {
            if (pref) email.notificationGroupName = pref.preferenceValue;
            //if email template has a domain and your domain is not itpx
            //you cannot access it
            if (!email) return response.sendData(res, [], {}, 'no email template');
            if (err) return validator.error(req, res, err, 'read');

            if (email.domain && domain != "itpx" && email.domain && email.domain != domain)
                return response.sendError(res, 403, "wrong domain");

            if (!email.status) email.status = "published";

            email = utils.emailTemplate.formatData(email);
            return response.sendData(res, email, {});
        })
    });
}

function validateEmail(emails) {
    if (emails) {
        var validatedEmails;
        if (typeof emails == "string")
            var validatedEmails = emails.split(',');
        else
            validatedEmails = emails;

        var isValid = true;
        _.each(validatedEmails, function(e) {
            if (!validator.validate(e, 'email')) {
                isValid = false;
                return null;
            }
        });
        if (!isValid)
            return null;
        else
            return validatedEmails;
    } else return null;
}

function create(req, res) {
    var from = validateEmail(req.body.from);
    var fromName = req.body.fromName;
    var to = validateEmail(req.body.to);
    var cc = validateEmail(req.body.cc);
    var bcc = validateEmail(req.body.bcc);
    var key = req.body.key;
    var text = req.body.text;
    var html = req.body.html;
    var subject = req.body.subject;
    var attatchment = req.body.attatchment;
    var emailTemplate = req.body.emailTemplate;
    var status = req.body.status;
    var type = req.body.type || "html";
    var extra = req.body.extra ? req.body.extra : {};
    var system = req.body.system;
    var chunks = req.body.chunks ? req.body.chunks : [];
    var defaultTemplate = req.body.defaultTemplate;
    var instructions = req.body.instructions;
    var notificationTitle = req.body.notificationTitle;
    var notificationMessageHtml = req.body.notificationMessageHtml;
    var notificationAlert = req.body.notificationAlert;
    var notificationMessageText = req.body.notificationMessageText;
    var notificationGroup = req.body.notificationGroup || req.body.notificationGroupName;

    var style = req.body.style || '';

    var tokenDomain = mercuryJWT.decode(req).domain;
    var domain; //tokenDomain ? tokenDomain : req.body.domain;

    var typeId = req.body.typeId ? req.body.typeId : key;
    var label = req.body.label;
    var configurations = validator.validate(req.body.configurations, 'array-str');

    if (!from && req.body.from)
        response.sendError(res, 400, 'invalid from email(s)');
    else if (req.body.fromName && !req.body.from)
        response.sendError(res, 400, 'from cannot be null if fromName is provided');
    else if (!key && req.body.key)
        response.sendError(res, 400, 'invalid template key');
    else if (!text && (!chunks || chunks.length == 0))
        response.sendError(res, 400, 'Email text is missing');
    else if (!html && (!chunks || chunks.length == 0))
        response.sendError(res, 400, 'Email html is missing');
    else if (!to && req.body.to)
        response.sendError(res, 400, 'invalid to email(s)');
    else if (!key && req.body.key)
        response.sendError(res, 400, 'Key is required');
    else if (!subject)
        response.sendError(res, 400, 'Email subject is missing');
    else {

        if (tokenDomain != "itpx" && req.body.domain && req.body.domain != tokenDomain)
            return response.sendError(res, 403, "wrong domain");

        if (tokenDomain == 'itpx' && req.body.domain) {
            domain = req.body.domain
        } else if (tokenDomain == 'itpx' && !req.body.domain) {
            domain = null;
        } else if (tokenDomain != 'itpx') {
            domain = tokenDomain
        }
        //domain is not being changed

        var template = new EmailTemplate();
        template.from = from;
        template.fromName = fromName;
        template.key = key;
        template.domain = domain;
        template.type = type;
        template.label = label;
        template.to = to;
        template.notificationTitle = notificationTitle;
        template.notificationMessageHtml = notificationMessageHtml;
        template.notificationAlert = notificationAlert;
        template.notificationMessageText = notificationMessageText;
        template.cc = cc;
        template.bcc = bcc;
        template.text = text;
        template.html = html;
        template.subject = subject;
        template.typeId = typeId;
        template.status = status;
        template.attatchment = attatchment;
        template.chunks = chunks;
        template.configurations = configurations;
        template.style = style;
        template.defaultTemplate = defaultTemplate;
        template.isChunked = chunks.length > 0 ? true : false;
        template.instructions = instructions;
        template.notificationGroup = notificationGroup;

        template.save(function(err, newTemplate) {
            if (err) return validator.error(req, res, err, 'create');
            template = utils.emailTemplate.formatData(newTemplate);
            response.sendData(res, template, {}, 'created');
        });
    }
}

function update(req, res) {
    var from = validateEmail(req.body.from);
    var fromName = req.body.fromName;
    var to = validateEmail(req.body.to);
    var cc = validateEmail(req.body.cc);
    var bcc = validateEmail(req.body.bcc);
    var type = req.body.type || "html";
    var key = req.body.key;
    var text = req.body.text;
    var html = req.body.html;
    var subject = req.body.subject;
    var status = req.body.status;
    var attatchment = req.body.attatchment;
    var emailTemplate = req.body.emailTemplate;
    var system = req.body.system;
    var tokenDomain = mercuryJWT.decode(req).domain;
    //var domain = tokenDomain ? tokenDomain : req.body.domain;
    var typeId = req.body.typeId ? req.body.typeId : key;
    var label = req.body.label;
    var extra = req.body.extra ? req.body.extra : {};
    var chunks = req.body.chunks && req.body.chunks.length ? req.body.chunks : null;
    var style = req.body.style;
    var instructions = req.body.instructions;
    var notificationTitle = req.body.notificationTitle;
    var notificationMessageHtml = req.body.notificationMessageHtml;
    var notificationMessageText = req.body.notificationMessageText;
    var notificationAlert = req.body.notificationAlert;
    var notificationGroup = req.body.notificationGroup || req.body.notificationGroupName;

    var configurations = validator.validate(req.body.configurations, 'array-str');

    if (!from && req.body.from)
        response.sendError(res, 400, 'invalid from email(s)');
    else if (req.body.fromName && !req.body.from)
        response.sendError(res, 400, 'from cannot be null if fromName is provided');
    else if (!to && req.body.to)
        response.sendError(res, 400, 'invalid to email(s)');
    else if (!key)
        response.sendError(res, 400, 'invalid key');
    else if (!text && (!chunks || chunks.length == 0))
        response.sendError(res, 400, 'Email text is missing');
    else if (!html && (!chunks || chunks.length == 0))
        response.sendError(res, 400, 'Email html is missing');
    else if (!subject)
        response.sendError(res, 400, 'Email subject is missing');
    else {
        EmailTemplate.findById(req.params.templateid, function(err, template) {
            if (tokenDomain == "itpx" || (tokenDomain && template.domain && template.domain == tokenDomain)) {
                if (!template) return validator.error(req, res, err, 'read');
                template.to = to;
                template.from = from || template.from;
                template.fromName = fromName;
                template.cc = cc;
                //template.domain = domain;
                template.typeId = typeId;
                template.label = label;
                template.bcc = bcc;
                template.key = key || template.key;
                template.type = type;
                template.text = text //|| template.text;
                template.html = html //|| template.html;
                template.subject = subject || template.subject;
                template.attatchment = attatchment || template.attatchment;
                template.status = status;
                template.configurations = configurations;
                if (chunks) {
                    template.chunks = chunks;
                    template.isChunked = chunks && chunks.length > 0 ? true : false;
                }
                template.style = style;
                template.instructions = instructions;
                template.notificationTitle = notificationTitle;
                template.notificationMessageHtml = notificationMessageHtml;
                template.notificationMessageText = notificationMessageText;
                template.notificationAlert = notificationAlert;
                template.notificationGroup = notificationGroup;

                template.save(function(err, newEmail) {
                    if (err) {
                        req.log.error("update-update-err", err)
                        return validator.error(req, res, err, 'create');
                    }

                    template = utils.emailTemplate.formatData(newEmail);
                    response.sendData(res, template, {}, 'created');
                });
            } else {
                return response.sendError(res, 403, "wrong domain, not allowed to update template");
            }
        });
    }
}



function deleteTemplateByKey(req, res) {
    EmailTemplate.findOne({ key: req.params.templatekey }, function(err, template) {
        if (err) return validator.error(req, res, err, 'delete');
        if (!template) return res.send({ data: {}, status: 'not removed' });

        EmailTemplate.findByIdAndRemove(template._id, function(err, deletedTemplate) {
            if (err || !deletedTemplate) return validator.error(req, res, err, 'delete');

            template = utils.emailTemplate.formatData(template);
            response.sendData(res, template, {}, 'delete');
        });
    });
}

function deleteTemplate(req, res) {
    EmailTemplate.findById(req.params.templateid, function(err, template) {
        if (err) return validator.error(req, res, err, 'delete');
        if (!template) return res.send({ data: {}, status: 'not removed' });

        EmailTemplate.findByIdAndRemove(template._id, function(err, deletedTemplate) {
            if (err || !deletedTemplate) return validator.error(req, res, err, 'delete');

            template = utils.emailTemplate.formatData(template);
            response.sendData(res, template, {}, 'delete');
        });
    });
}

function testTemplate(req, res) {
    User.findById(req.userId, function(err, user) {
        if (!user) response.sendError(res, 400, "User not found");
        var from = validateEmail(req.body.from);
        var fromName = req.body.fromName;
        var extra = req.body.extra ? req.body.extra : {};
        var to = user.local.username;
        var attachment = req.body.attachment;
        var attachmentFileName = req.body.attachmentFileName;
        var emailTemplate = req.body.key;
        var system = req.body.system;

        if (!from && req.body.from)
            response.sendError(res, 400, 'invalid from email(s)');
        else if (!to && req.body.to)
            response.sendError(res, 400, 'invalid to email(s)');
        else {
            var email = new Email();
            email.from = fromName ? '' + fromName + '' + '<' + from + '>' : from;
            email.to = to;
            email.emailTemplate = emailTemplate;
            email.attachment = attachment;
            email.attachmentFileName = attachmentFileName;
            email.isProcessed = false;
            email.extra = extra;
            email.numberOfTries = 1;
            email.firstAtempt = new Date();
            email.lastAtempt = new Date();

            email.save(function(err, newEmail) {
                if (err) return validator.error(req, res, err, 'create');
                else {
                    notificationSender.send(email);
                    console.log("calling notificationSender.send 5");
                    var returnEmail = utils.email.formatData(newEmail);
                    response.sendData(res, newEmail, {}, 'created');
                }
            });
        }
    })
}

function getByKey(req, res) {
    var domain = mercuryJWT.decode(req).domain;

    EmailTemplate.findOne({ key: req.params.templatekey }, function(err, email) {
        //if email template has a domain and your domain is not itpx
        //you cannot access it
        if (!email) return response.sendData(res, [], {}, 'no email template');
        if (err) return validator.error(req, res, err, 'read');

        if (email.domain && domain != "itpx" && email.domain && email.domain != domain)
            return response.sendError(res, 403, "wrong domain");

        if (!email.status) email.status = "published";
        email = utils.emailTemplate.formatData(email);
        return response.sendData(res, email, {});

    });
}



module.exports = {
    list: function(req, res) {
        list(req, res);
    },
    dictionaryList: function(req, res) {
        dictionaryList(req, res);
    },
    details: function(req, res) {
        details(req, res);
    },
    create: function(req, res) {
        create(req, res);
    },
    update: function(req, res) {
        update(req, res);
    },
    delete: function(req, res) {
        deleteTemplate(req, res);
    },
    deleteByKey: function(req, res) {
        deleteTemplateByKey(req, res);
    },
    test: function(req, res) {
        testTemplate(req, res);
    },
    getByKey: function(req, res) {
        getByKey(req, res);
    },
    domainTemplateList: function(req, res) {
        domainTemplateList(req, res);
    }
}