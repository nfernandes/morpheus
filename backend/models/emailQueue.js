'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var connectionAmber = require('./connectionMorpheus.js');

var emailQueueSchema = mongoose.Schema({
    from: String,
    to: [String],
    replyto: String,
    cc: [String],
    bcc: [String],
    subject: String,
    text: String,
    html: String,
    created: String,
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


emailQueueSchema.methods.updatelastEmailAtempt = function() {
    var currentDate = new Date();
    this.firstAtempt = currentDate;
    this.save();
}

emailQueueSchema.methods.updatefirstEmailAtempt = function() {
    var currentDate = new Date();
    this.lastlogin = currentDate;
    this.save();
}

emailQueueSchema.plugin(mongoosePaginate);
var emailQueue = connectionAmber.model('emailQueue', emailQueueSchema);
module.exports = emailQueue;