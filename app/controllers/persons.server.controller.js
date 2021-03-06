'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Person = mongoose.model('Person'),
  Task = mongoose.model('Task'),
  _ = require('lodash');

/**
 * Create a Person
 */
exports.createPerson = function(req, res) {
  var person = new Person(req.body);
  person.user = req.user;

  person.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(person);
    }
  });
};

/**
 * Show the current Person details
 */
exports.getPersonDetails = function(req, res) {
  Task.find({
    'person': req.person._id
  }, function(err, tasks) {
    req.person.tasks = tasks;
  });
  res.jsonp(req.person);
};

/**
 * Show the current Person
 */
exports.read = function(req, res) {
  res.jsonp(req.person);
};

/**
 * Update a Person
 */

exports.updatePerson = function(req, res) {

  var person = req.person;

  person = _.extend(person, req.body);

  person.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(person);
    }
  });

};

/**
 * Delete an Person
 */
exports.deletePerson = function(req, res) {

  var person = req.person;

  person.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(person);
    }
  });
};

/**
 * List of Persons
 */
exports.listPersons = function(req, res) {
  Person.find({'user': req.user._id}).where(req.query).sort('-created').populate('user', 'username').populate('tasks', 'projectName personName startDate endDate').exec(function(err, persons) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(persons);
    }
  });
};

/**
 * Person middleware
 */
exports.personByID = function(req, res, next, id) {
  Person.findById(id).populate('user', 'username').exec(function(err, person) {
    if (err) return next(err);
    if (!person) return next(new Error('Failed to load Person ' + id));
    req.person = person;
    next();
  });
};

/**
 * Person authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.person.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
