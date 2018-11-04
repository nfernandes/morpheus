'use strict';
var validator = require('validator');

//to check if the data passed is an email
//not used on the moment to keep it simple
function checkEmail(email) {
    var newEmail = validator.trim(email);
    if (validator.isEmail(newEmail, { allow_display_name: true }))
        return newEmail;
    else
        return null;
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