'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	request = require('supertest'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Person = mongoose.model('Person');

/**
 * Globals
 */
var person1, person2, user1, user2;
var agent = request.agent('http://localhost:3001');

describe('Person Endpoint Tests', function() {
    
    it("Create Users", function(done) {
    	user1 = new User({
			name: 'Full',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		user2 = new User({
			name: 'Another Joe',
			displayName: 'Another',
			email: 'joe@another.com',
			username: 'anotherjoe',
			password: 'password',
			provider: 'local'
		});
		
		user1.save(function(){});

		user2.save(function() {
			done();
		});
    });

    it("Create persons", function(done) {
    	person1 = new Person({
			name: "Person1",
      email: "person1@mail.com",
			user: user1
		});

		person2 = new Person({
			name: "Person2",
      email: "person2@mail.com",
			user: user2
		});

		person1.save(function(){});

		person2.save(function() {
			done();
		});
    })
    it("should not create project if user is not logged in", function(done) {
    	agent.post('/persons')
    	.send({name: 'example'})
    	.expect(401)
    	.end(onResponse);

    	function onResponse(err, res) {
    		if(err) return done(err);
    		return done();
    	}
    });

    it("should login User", function(done) {
        agent.post('/auth/signin')
            .send({ email: 'test@test.com', password: 'password' })
            .expect(200)
            .end(onResponse);

        function onResponse(err, res) {
           	if (err) return done(err);
           	return done();
        }
    });

    it('should not delete a person that does not belong to him', function(done) {
    	agent.delete('/persons/' + person2._id)
		  .expect(403)
   		// end handles the response
		  .end(function(err, res) {
          	if (err) {
            	throw err;
          	}
          	return done();
        });
    });

    it('should not create a person that already exists', function(done) {
    	agent.post('/persons')
    	.send(person1)
		  .expect(400)

   		// end handles the response
		  .end(function(err, res) {
          	if (err) {
            	throw err;
          	}
          	return done();
        });
    });

    it('should not create a person without an email', function(done) {
      agent.post('/persons')
      .send({name: 'new person', email: ''})
      .expect(400)

      .end(function(err, res) {
            if (err) {
              throw err;
            }
            return done();
        });
    });

    it('should not create a person without name', function(done) {
      agent.post('/persons')
      .send({name: '', email:'jyd@y.com'})
      .expect(400)

      .end(function(err, res){
        if(err) {
          throw err;
        }
        return done();
      });
    });

    it('should be able to delete a person', function(done){
      agent.delete('/persons/' + person1._id)
      .expect(200)

      .end(function(err, res){
        if(err){
          throw err;
        }
        return done();
      });
    });

	after(function(done) {
		Person.remove().exec();
		User.remove().exec();
		done();
	});
});