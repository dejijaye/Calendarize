'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Project = mongoose.model('Project'),
  Task = mongoose.model('Task'),
  _ = require('lodash');

/**
 * Create a Project
 */
exports.createProject = function(req, res) {

  var project = new Project(req.body);
  project.user = req.user;
  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Show the current Project
 */
exports.readProject = function(req, res) {
  res.jsonp(req.project);
};

/**
 * Update a Project
 */
exports.updateProject = function(req, res) {

  var project = req.project;

  project = _.extend(project, req.body);

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Delete an Project
 */
exports.deleteProject = function(req, res) {

  var project = req.project;

  project.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * List of Projects
 */
exports.listProjects = function(req, res) {
  Project.find({'user':req.user._id}).where(req.query).sort('-created').populate('user', 'username').populate('tasks', 'projectName personName startDate endDate').exec(function(err, projects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(projects);
    }
  });
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) {
  Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
    if (err) return next(err);
    if (!project) return next(new Error('Failed to load Project ' + id));
    req.project = project;
    next();
  });
};

/**
 * Project authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.project.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
