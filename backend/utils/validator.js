var validator = require('validator');
var sanitize = require('mongo-sanitize');
var content = require('../constants/content/content-en.js');
var settings = require('../config');
var _ = require("lodash");
var response = require('../utils/response.js');

function removeTrailingSlash(url) {
    if (url.substr(-1) == '/') {
        return url.substr(0, url.length - 1);
    }
    return url;
}

function responseAPI(req, res, type) {

    if (type && type == 'success') {
        var response = content.API.success;
        if (req.transactionid) response.transaction = req.transactionid;
        res.status(200).json(response);

    } else if (type && type == 'nodata') {
        var response = content.API.nodata;
        if (req.transactionid) response.transaction = req.transactionid;
        res.status(204).json(response);

    } else if (type && type == 'registered') {
        var response = content.API.registered;
        if (req.transactionid) response.transaction = req.transactionid;

        res.json(response);

    } else {

        //todo replace in different levels 
        //check if is get or post
        //in case of get - > 404
        //otherwise -? 405
        if (type && type == 'nav') {
            response.sendError(res, 404, content.API.naverror);

        } else if (type && type == 'db') {
            response.sendError(res, 400, content.API.dberror);

        } else if (type && type == 'serv') {
            response.sendError(res, 400, content.API.servererror);

        } else if (type && type == 'unauthenticated') {
            response.sendError(res, 401, content.API.unauthenticated);

        } else if (type && type == 'unauthorized') {
            response.sendError(res, 403, content.API.unauthorized);

        } else if (type && type == 'noprovider') {
            response.sendError(res, 501, content.API.noprovider);

        } else if (type && type == 'malformed') {
            response.sendError(res, 400, content.API.malformedip);

        } else if (type && type == 'noconsumers') {
            res.json(content.API.noconsumers);

        } else if (type && type == 'communication') {
            res.json(content.API.communicationerror);
        } else {
            response.sendError(res, 500, content.API.processingerror);

        }
    }
}

function handleError(req, res, err, action) {
    var type = null;
    var error = "";
    if (err) {
        error = err;
        req.log.error("handleError " + err);

        if (err.code == 11000 || err == "dup")
            response.sendError(res, 400, 'duplicated entity');

        else if (error.name == "CastError")
            response.sendData(res, []);
        //res.send({ data: [] }); //no results for this id

        else if (err == 'invalid')
            response.sendError(res, 400, 'invalid');

        else if (err == 'sys')
            response.sendError(res, 401, 'sysuser=true');

        else if (err == 'nav')
            response.sendError(res, 400, 'nav');

        else if (err.name == 'ValidatorError')
            response.sendError(res, 400, 'ValidatorError');

        else if (err == 'unauth')
            response.sendError(res, 401, 'User does not allowed to perform that action');

        else if (err == 'db')
            response.sendError(res, 400, 'database error');

        else
            response.sendError(res, 400, 'Generic error');
    }
}

function ipvalidation(field, type) {
    if (field) {
        if (type == 'type') {
            if (field.type) {
                if (field.type == "gmail")
                    return "gmail";
                else if (type == "exchange") {
                    return "exchange";
                } else
                    return "basic";
            } else {
                return "basic";
            }
        } else if (type == 'username') {
            field = validator.trim(field);
            field = field.toLowerCase();
            if (validator.isLength(field, { min: 5, max: 100 }) && validator.isAlphanumeric(field))
                if (validator.isEmail(field))
                    return field;
                else
                    return null;
        }
        if (type == 'email') {
            field = validator.trim(field);
            if (validator.isEmail(field, { allow_display_name: true }))
                return field;
            else
                return null;
        } else if (type == 'password') {
            if (validator.isLength(field, { min: 5, max: undefined }))
                return field;
            else
                return null;
        } else if (type == 'name') {
            field = validator.trim(field);
            if (validator.isLength(field, { min: 3, max: undefined }))
                return field;
            else
                return null;
        } else if (type == 'configvalue') {
            field = validator.trim(field);
            if (validator.isLength(field, { min: 3, max: undefined }))
                return field;
            else
                return null;
        } else if (type == 'group' || type == 'location') {
            field = validator.trim(field.toLowerCase());
            if (validator.isAlphanumeric(field) && validator.isLength(field, { min: 2, max: undefined }))
                return field;
            else
                return null;
        } else if (type == 'url') {
            field = validator.trim(field);
            field = field.toLowerCase();
            field = removeTrailingSlash(validator.trim(field));
            if (validator.isURL(field, { require_protocol: true, require_valid_protocol: true }))
                return field;
            else
                return null;
        } else if (type == 'url-notrail') {
            field = validator.trim(field);
            field = field.toLowerCase();
            field = validator.trim(field);
            if (validator.isURL(field, { require_protocol: true, require_valid_protocol: true }))
                return field;
            else
                return null;
        } else if (type == 'boolean') {
            if (typeof field == 'boolean')
                return field;
            else if (field == 'true')
                return true;
            else if (field == 'false')
                return false;
            else
                return validator.toBoolean(field, true);
        } else if (type == 'configkey') {
            field = validator.trim(field.toLowerCase());
            if (validator.isLength(field, { min: 1, max: undefined })) {
                field = validator.whitelist(field, 'a-z0-9\-:');
                return field;
            }
            return null;
        } else if (type == 'path') {
            field = validator.trim(field.toLowerCase());
            if (validator.isLength(field, { min: 1, max: undefined })) {
                field = validator.whitelist(field, 'a-z0-9/:+?-');
                field = field.replace("//", "/");
                if (!field.startsWith("/"))
                    field = "/" + field;
                return field;
            } else
                return null;
        } else if (type == 'json') {
            try {
                field = JSON.parse(field);
            } catch (e) {
                field = {};
            }
            return field;
        }
        // to be added more validators
        else
            return field;
    } else {
        if (type == 'boolean') {
            if (typeof field == 'boolean')
                return field;
            else if (field == 'true')
                return true;
            else if (field == 'false')
                return false;
            else if (field == undefined)
                return null;
            else
                return validator.toBoolean(field, true);
        }
        return null;
    }

}


module.exports = {
    validate: function(field, type) {
        return ipvalidation(field, type);
    },
    error: function(req, res, err, action) {
        handleError(req, res, err, action);
    },
    apiresponse: function(req, res, type) {
        responseAPI(req, res, type);
    }
}