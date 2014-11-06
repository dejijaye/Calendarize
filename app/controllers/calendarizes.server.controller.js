'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),

	Project = mongoose.model('Project'),
	Person = mongoose.model('Person'),
	Task = mongoose.model('Task'),
	_ = require('lodash');


/* Authentication Middleware */

exports.hasProjectAuthorization = function(req, res, next) {
	if (req.project.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.hasPersonAuthorization = function(req, res, next) {
	if (req.person.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.hasTaskAuthorization = function(req, res, next) {
	if (req.task.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/* Middleware */

exports.projectByID = function(req, res, next, id) { Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
		if (err) return next(err);
		if (! project) return next(new Error('Failed to load Person ' + id));
		req.project = project ;
		next();
	});
};

exports.personByID = function(req, res, next, id) { Person.findById(id).populate('user', 'displayName').exec(function(err, person) {
		if (err) return next(err);
		if (! person) return next(new Error('Failed to load Person ' + id));
		req.person = person;
		next();
	});
};

exports.taskByID = function(req, res, next, id) { Task.findById(id).populate('user', 'displayName').exec(function(err, task) {
		if (err) return next(err);
		if (! task) return next(new Error('Failed to load Task' + id));
		req.task = task;
		next();
	});
};


/*	==========================
		Project Controller
	==========================	*/

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

exports.listProjects = function(req, res) {
    
    Project.find().sort('-created').exec(function(err, projects) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
        	// TODO: Add tasks
            res.jsonp(projects);
        }
    });
};

exports.updateProject = function(req, res) {
	
	var project = req.project;

	project = _.extend(project , req.body);

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

/*
exports.readProject = function(req, res) {

	Task.find({'project':req.project._id}).populate('person').populate('project').exec( function(err, assignments){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				req.project.people = assignments;

				res.jsonp(req.project);
			}
	});
	
};
*/

exports.deleteProject = function(req, res) {
	
	var project = req.project ;

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


/*	==========================
		Person Controller
	==========================	*/

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

exports.listPersons = function(req, res) { Person.find().sort('-created').populate('user', 'displayName').exec(function(err, persons) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(persons);
		}
	});
};

exports.getPersonDetails = function(req, res) {
	Task.find({'person':req.person._id}, function(err, tasks) {
		req.person.tasks = tasks;
	});
	res.jsonp(req.person);
};

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

exports.updatePerson = function(req, res) {
	
	var person = req.person;

	person = _.extend(person , req.body);

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



/*	==========================
		Task Controller
	==========================	*/


exports.createTask = function(req, res) {

	var task = new Task(req.body);

	task.user = req.user;


	task.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});

};

exports.listTasks = function(req, res) { Task.find().sort('-created').populate('person', 'name').populate('project', 'projectname').exec(function(err, tasks) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tasks);
		}
	});
};



exports.readTask = function(req, res) {
	res.jsonp(req.task);
};

exports.deleteTask = function(req, res) {
	
	var task = req.task ;

	task.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});
};

exports.updateTask = function(req, res) {
	var task = req.task ;

	task = _.extend(task, req.body);

	task.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});
};

