'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verificationtoken = mongoose.model('Verificationtoken'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Verificationtoken
 */
exports.create = function(req, res) {
	var verificationtoken = new Verificationtoken(req.body);
	verificationtoken.user = req.user;

	verificationtoken.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verificationtoken);
		}
	});
};

/**
 * Show the current Verificationtoken
 */
exports.read = function(req, res) {
	res.jsonp(req.verificationtoken);
};

/**
 * Update a Verificationtoken
 */
exports.update = function(req, res) {
	var verificationtoken = req.verificationtoken ;

	verificationtoken = _.extend(verificationtoken , req.body);

	verificationtoken.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verificationtoken);
		}
	});
};

/**
 * Delete an Verificationtoken
 */
exports.delete = function(req, res) {
	var verificationtoken = req.verificationtoken ;

	verificationtoken.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verificationtoken);
		}
	});
};

/**
 * List of Verificationtokens
 */
exports.list = function(req, res) { 
	Verificationtoken.find().sort('-created').populate('user', 'displayName').exec(function(err, verificationtokens) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verificationtokens);
		}
	});
};

/**
 * Verificationtoken middleware
 */
exports.verificationtokenByID = function(req, res, next, id) { 
	Verificationtoken.findById(id).populate('user', 'displayName').exec(function(err, verificationtoken) {
		if (err) return next(err);
		if (! verificationtoken) return next(new Error('Failed to load Verificationtoken ' + id));
		req.verificationtoken = verificationtoken ;
		next();
	});
};

/**
 * Verificationtoken authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.verificationtoken.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};


var verifyUser = function(token, done) {
    Verificationtoken.findOne({token: token}, function (err, doc){
        if (err) {
        	return done(err);
        }
        if (doc) {
	        User.findOne({_id: doc._userId}, function (err, user) {
	        	console.log(user);
	            if (err) return done(err);
	            user.verified = true;
	            user.save(function(err) {
	            	console.log(user);
	              return done(err);
	            });
	        });
    	}
    	else{
    		return done(new Error('Token not found'));
    	}
    });
};

exports.verifyToken = function(req, res, next) {
	var token = req.params.token;
    verifyUser(token, function(err) {
        if (err) return res.status(400).send('Token not valid');
        res.status(200).send('User is verified');
        //res.redirect('/#!/signin');
    });
};


