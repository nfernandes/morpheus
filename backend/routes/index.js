'use strict';

// group
var express = require('express');
var router = express.Router();
var response = require('../utils/response.js');

/********************* LOAD ROUTES ***********************/
router.get('/testing', function(req, res) {
    res.render('message', { user: req.user, db: true });
});


/**************************** MANAGE ****************************************/
router.use('/api/templates', require('./templates'));
router.use('/api/generaltemplates', require('./generalTemplates'));
router.use('/api/emails', require('./emails'));
router.use('/api/emailogs', require('./emailLogs'));
router.use('/api/smtps', require('./smtps'));
router.use('/api/configurations', require('./configurations'));
router.use('/api/preferences', require('./preferences'));
router.use('/api/notifications', require('./notifications'));
router.use('/api/newnotifications', require('./newnotifications'));
router.use('/api/invitations', require('./invitations'));
//router.use('/api/bouncedemails', require('./bouncedEmails'));

/********************* MONITORING *************************/

router.use('/api/version', require('./version'));

/********************* Error handling for non existent apis *************************/
router.all('*', function(req, res) {
    response.sendError(res, 404);
})

/********************* TEST APIS ***********************/
router.get('/500', function(req, res, next) {
    var err = new Error('Internal Error');
    err.status = 500;
    next(err);
});

module.exports = router;