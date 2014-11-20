'use strict';

(function() {
	// Persons Controller Spec
	describe('Persons Controller Tests', function() {
		// Initialize global variables
		var PersonsController,
		scope,
		$httpBackend,
		ganttController,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});
		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Persons controller.
			PersonsController = $controller('PersonsController', {
				$scope: scope
			});

		}));

		it('$scope.addPerson() we should be able to add a person ', inject(function(Persons){
			var dummyPerson = new Persons({
				name : 'person',
				email : 'test@test.com'
			});

			scope.person = {
				name: 'Person',
				email: 'test@test.com'
			};

			var newData = [{
				'id': '525cf20451979dea2c000001',
				'name': dummyPerson.name,
				'tasks': []
			}];

			scope.loadData(newData);

			$httpBackend.expectPOST('persons').respond(dummyPerson);

			scope.addPerson();
			$httpBackend.flush();
			expect(scope.person).toBe('');
		}));
	});
}());