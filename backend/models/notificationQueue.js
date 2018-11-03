'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var connectionAmber = require('./connectionMorpheus.js');

var notificationQueueSchema = mongoose.Schema({
    from: String,
    to: [String],
    replyto: String,
    cc: [String],
    bcc: [String],
    subject: String,
    text: String,
    html: String,
    created: String,
    toNumber: String,
    fromNumber: String,
    emailTemplate: String,
    attachment: [String],
    attachmentFileName: [String],
    isProcessed: Boolean,
    isFailed: Boolean,
    error: String,
    extra: {},
    system: String,
    isBounced: { type: Boolean, default: false },
}, { timestamps: true });


//we can have retry/send again functionality 
notificationQueueSchema.methods.updatelastEmailAtempt = function() {
    var currentDate = new Date();
    this.firstAtempt = currentDate;
    this.save();
}

notificationQueueSchema.methods.updatefirstEmailAtempt = function() {
    var currentDate = new Date();
    this.lastlogin = currentDate;
    this.save();
}

notificationQueueSchema.plugin(mongoosePaginate);
var notificationQueue = connectionAmber.model('notificationQueue', notificationQueueSchema);
module.exports = notificationQueue;