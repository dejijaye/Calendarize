'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'task';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ngAnimate',
        'mgcrea.ngStrap',
        'ui.bootstrap',
        'ui.utils',
        'gantt',
        'nsPopover'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('persons');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('projects');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tasks');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;  // console.log($scope.authentication.user);
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
//Setting up route
angular.module('persons').config([
  '$stateProvider',
  function ($stateProvider) {
    // Persons state routing
    $stateProvider.state('listPersons', {
      url: '/persons',
      templateUrl: 'modules/persons/views/list-persons.client.view.html'
    }).state('createPerson', {
      url: '/persons/create',
      templateUrl: 'modules/persons/views/create-person.client.view.html'
    }).state('viewPerson', {
      url: '/persons/:personId',
      templateUrl: 'modules/persons/views/view-person.client.view.html'
    }).state('editPerson', {
      url: '/persons/:personId/edit',
      templateUrl: 'modules/persons/views/edit-person.client.view.html'
    });
  }
]);'use strict';
// Persons controller
angular.module('persons').controller('PersonsController', [
  '$http',
  '$scope',
  '$stateParams',
  '$location',
  '$timeout',
  'Authentication',
  'GANTT_EVENTS',
  '$modal',
  'Persons',
  function ($http, $scope, $stateParams, $location, $timeout, Authentication, GANTT_EVENTS, $modal, Persons) {
    $scope.authentication = Authentication;
    // Create new Person
    $scope.addPerson = function () {
      var person = new Persons($scope.person);
      person.$save(function (response) {
        if (switchViews.myView !== 'Project') {
          $scope.person = '';
          var newPerson = [{
                'id': response._id,
                'name': response.name,
                'tasks': []
              }];
          $scope.loadData(newPerson);
        }
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Person
    $scope.removePerson = function (person) {
      if (person) {
        person.$remove();
        for (var i in $scope.persons) {
          if ($scope.persons[i] === person) {
            $scope.persons.splice(i, 1);
          }
        }
      } else {
        $scope.person.$remove(function () {
        });
      }
    };
    // Update existing Person
    $scope.updatePerson = function () {
      var person = $scope.person;
      person.$update(function () {
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Persons
    $scope.findPersons = function () {
      var data = [];
      $scope.persons = Persons.query({}, function () {
        $scope.persons.forEach(function (user) {
          var $user = {};
          $user.tasks = [];
          $user.id = user._id;
          $user.name = user.name;
          user.tasks.forEach(function (task) {
            var $task = {};
            $task.id = task._id;
            $task.name = task.projectName;
            $task.from = task.startDate;
            $task.to = task.endDate;
            $task.color = '#F1C232';
            $user.tasks.push($task);
          });
          data.push($user);
        });
        $scope.loadData(data);
      });
    };
    // Find existing Person
    $scope.findOnePerson = function () {
      $scope.person = Persons.get({ personId: $stateParams.personId });
    };
  }
]);'use strict';
//Persons service used to communicate Persons REST endpoints
angular.module('persons').factory('Persons', [
  '$resource',
  function ($resource) {
    return $resource('persons/:personId', { personId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('projects').config([
  '$stateProvider',
  function ($stateProvider) {
    // Projects state routing
    $stateProvider.state('listProjects', {
      url: '/projects',
      templateUrl: 'modules/projects/views/list-projects.client.view.html'
    }).state('createProject', {
      url: '/projects/create',
      templateUrl: 'modules/projects/views/create-project.client.view.html'
    }).state('viewProject', {
      url: '/projects/:projectId',
      templateUrl: 'modules/projects/views/view-project.client.view.html'
    }).state('editProject', {
      url: '/projects/:projectId/edit',
      templateUrl: 'modules/projects/views/edit-project.client.view.html'
    });
  }
]);'use strict';
// Projects controller
angular.module('projects').controller('ProjectsController', [
  '$http',
  '$scope',
  '$stateParams',
  '$location',
  '$timeout',
  'Authentication',
  'GANTT_EVENTS',
  '$modal',
  'Projects',
  'Tasks',
  'switchViews',
  function ($http, $scope, $stateParams, $location, $timeout, Authentication, GANTT_EVENTS, $modal, Projects, Tasks, switchViews) {
    $scope.authentication = Authentication;
    // Create new Project
    $scope.addProject = function () {
      var project = new Projects($scope.project);
      project.$save(function (response) {
        if (switchViews.myView !== 'Person') {
          $scope.project = '';
          var newProject = [{
                'id': response._id,
                'name': response.name,
                'tasks': []
              }];
          $scope.loadData(newProject);
        }
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Project
    $scope.removeProject = function (project) {
      if (project) {
        project.$remove();
        for (var i in $scope.projects) {
          if ($scope.projects[i] === project) {
            $scope.projects.splice(i, 1);
          }
        }
      } else {
        $scope.project.$remove(function () {
        });
      }
    };
    // Update existing Project
    $scope.updateProject = function () {
      var project = $scope.project;
      project.$update(function () {
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find existing Projects
    $scope.findOneProject = function () {
      $scope.project = Projects.get({ projectId: $stateParams.projectId });
    };
  }
]);// 'use strict';
// angular.module('calendarizes').directive('custompopover', [
// 	return {
//         restrict: 'E',
//         templateUrl: 'popover.html',  
//     };
// ]);
'use strict';
//Projects service used to communicate Projects REST endpoints
angular.module('projects').factory('Projects', [
  '$resource',
  function ($resource) {
    return $resource('projects/:projectId', { projectId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('tasks').config([
  '$stateProvider',
  function ($stateProvider) {
    // Tasks state routing
    $stateProvider.state('listTasks', {
      url: '/tasks',
      templateUrl: 'modules/tasks/views/list-tasks.client.view.html'
    }).state('createTask', {
      url: '/tasks/create',
      templateUrl: 'modules/tasks/views/create-task.client.view.html'
    }).state('viewTask', {
      url: '/tasks/:taskId',
      templateUrl: 'modules/tasks/views/view-task.client.view.html'
    }).state('editTask', {
      url: '/tasks/:taskId/edit',
      templateUrl: 'modules/tasks/views/edit-task.client.view.html'
    });
  }
]);'use strict';
// Tasks controller
angular.module('tasks').controller('ModalInstanceCtrl', [
  '$rootScope',
  '$scope',
  '$modalInstance',
  'Projects',
  'Persons',
  'switchViews',
  function ($rootScope, $scope, $modalInstance, Projects, Persons, switchViews) {
    // Find a list
    if (switchViews.myView === 'Project') {
      $scope.findData = function () {
        $scope.datas = Persons.query();
      };
    } else if (switchViews.myView === 'Person') {
      $scope.findData = function () {
        $scope.datas = Projects.query();
      };
    }
    $scope.selectedData = function (data) {
      $modalInstance.close(data);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);'use strict';
// Tasks controller
angular.module('tasks').controller('TasksController', [
  '$http',
  '$scope',
  '$stateParams',
  '$location',
  '$timeout',
  'Authentication',
  'Uuid',
  'Sample',
  'moment',
  'GANTT_EVENTS',
  '$modal',
  'Persons',
  'Projects',
  'Tasks',
  'switchViews',
  function ($http, $scope, $stateParams, $location, $timeout, Authentication, Uuid, Sample, moment, GANTT_EVENTS, $modal, Persons, Projects, Tasks, switchViews) {
    $scope.authentication = Authentication;
    var assignment = {};
    var autoView = {};
    autoView.resource = Persons;
    switchViews.myView = 'Person';
    $scope.openProject = function (size) {
      var modalInstance = $modal.open({
          templateUrl: 'projectModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: 'sm',
          resolve: {
            projects: function () {
              return $scope.projects;
            }
          }
        });
      modalInstance.result.then(function (data) {
        if (switchViews.myView === 'Person') {
          assignment.projectId = data._id;
          assignment.projectName = data.name;
        } else {
          assignment.personId = data._id;
          assignment.personName = data.name;
        }
        $scope.createTask(assignment);
      }, function () {
      });
    };
    $scope.getTaskData = function () {
      var dataObj = [];
      $scope.dbData = autoView.resource.query({}, function () {
        $scope.dbData.forEach(function (assign) {
          var $owner = {};
          $owner.tasks = [];
          $owner.id = assign._id;
          $owner.name = assign.name;
          assign.tasks.forEach(function (task) {
            var $task = {};
            $task.id = task._id;
            $task.name = task.personName;
            $task.from = task.startDate;
            $task.to = task.endDate;
            $task.color = '#F1C232';
            if (switchViews.myView === 'Person') {
              $task.name = task.projectName;
            } else {
              $task.name = task.personName;
            }
            $owner.tasks.push($task);
          });
          dataObj.push($owner);
        });
        $scope.loadData(dataObj);
      });
    };
    // Creating a new Assignment/Task
    $scope.createTask = function (data) {
      var newTask = {
          personId: data.personId,
          projectId: data.projectId,
          startDate: data.startDate,
          endDate: data.endDate
        };
      var task = new Tasks(newTask);
      task.$save(function (response) {
        var taskParam = {
            id: response._id,
            from: response.startDate,
            to: response.endDate,
            color: '#F1C232'
          };
        if (switchViews.myView === 'Person') {
          taskParam.name = response.projectName;
        } else {
          taskParam.name = response.personName;
        }
        var uiItem = data.infoData.row.addTask(taskParam);
        uiItem.updatePosAndSize();
        uiItem.row.updateVisibleTasks();  //learn about $scope.apply
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.updateTask = function (event, data) {
      var task = Tasks.get({ taskId: data.task.id });
      task._id = data.task.id;
      task.startDate = data.task.from;
      task.endDate = data.task.to;
      task.$update(function () {
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    /************************************************
TIMELIME
************************************************/
    $scope.options = {
      mode: 'custom',
      scale: 'day',
      maxHeight: false,
      width: true,
      autoExpand: 'both',
      taskOutOfRange: 'expand',
      fromDate: undefined,
      toDate: undefined,
      showLabelsColumn: true,
      currentDate: 'line',
      currentDateValue: Date.now(),
      draw: true,
      allowLabelsResizing: true,
      timeFrames: {
        'day': {
          start: moment('8:00', 'HH:mm'),
          end: moment('20:00', 'HH:mm'),
          working: true,
          default: true
        },
        'noon': {
          start: moment('12:00', 'HH:mm'),
          end: moment('13:30', 'HH:mm'),
          working: false,
          default: true
        },
        'weekend': { working: false }
      },
      dateFrames: {
        'weekend': {
          evaluator: function (date) {
            return date.isoWeekday() === 6 || date.isoWeekday() === 7;
          },
          targets: ['weekend']
        }
      },
      timeFramesNonWorkingMode: 'visible',
      columnMagnet: '5 minutes'
    };
    $scope.$watch('fromDate+toDate', function () {
      $scope.options.fromDate = $scope.fromDate;
      $scope.options.toDate = $scope.toDate;
    });
    $scope.$watch('options.scale', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
        if (newValue === 'quarter') {
          $scope.options.headersFormats = { 'quarter': '[Q]Q YYYY' };
          $scope.options.headers = ['quarter'];
        } else {
          $scope.options.headersFormats = undefined;
          $scope.options.headers = undefined;
        }
      }
    });
    $scope.$on(GANTT_EVENTS.READY, function () {
      $scope.addSamples();
      $timeout(function () {
        $scope.scrollToDate($scope.options.currentDateValue);
      }, 0, true);
    });
    $scope.addSamples = function () {
      $scope.loadTimespans(Sample.getSampleTimespans().timespan1);
      $scope.loadData($scope.getTaskData());
    };
    $scope.loadProjectsData = function () {
      switchViews.myView = 'Project';
      autoView.resource = Projects;
      $scope.clearData();
      $scope.getTaskData();
    };
    $scope.loadPersonsData = function () {
      switchViews.myView = 'Person';
      autoView.resource = Persons;
      $scope.clearData();
      $scope.getTaskData();
    };
    var handleClickEvent = function (event, data) {
      console.log(data);
      if (switchViews.myView === 'Person') {
        assignment.personId = data.row.id;
      } else {
        assignment.projectId = data.row.id;
      }
      $scope.openProject();
      if ($scope.options.draw) {
        if ((data.evt.target ? data.evt.target : data.evt.srcElement).className.indexOf('gantt-row') > -1) {
          assignment.startDate = data.date;
          assignment.endDate = moment(data.date).add(7, 'd');
          assignment.infoData = data;
        }
      }
    };
    $scope.$on(GANTT_EVENTS.TASK_DBL_CLICKED, function (event, data) {
      data.task.row.removeTask(data.task.id);
      Tasks.delete({ taskId: data.task.id });
    });
    $scope.$on(GANTT_EVENTS.TASK_CHANGED, function (event, data) {
      $scope.updateTask(event, data);
    });
    $scope.$on(GANTT_EVENTS.TASK_MOVE_END, function (event, data) {
    });
    $scope.$on(GANTT_EVENTS.TASK_RESIZE_END, $scope.updateTask);
    $scope.$on(GANTT_EVENTS.ROW_CLICKED, handleClickEvent);
  }
]);'use strict';
//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', [
  '$resource',
  function ($resource) {
    return $resource('tasks/:taskId', { taskId: '@_id' }, { update: { method: 'PUT' } });
  }
]);
angular.module('tasks').factory('switchViews', [
  '$rootScope',
  function ($rootScope) {
    var service = {};
    service.myView = '';
    return service;
  }
]);
angular.module('tasks').service('Sample', function Sample() {
  return {
    getSampleData: function () {
      return {};
    },
    getSampleTimespans: function () {
      return {
        'timespan1': [{
            id: '1',
            from: new Date(2014, 9, 21, 8, 0, 0),
            to: new Date(2014, 11, 25, 15, 0, 0),
            name: 'Sprint 1 Timespan'
          }]
      };
    }
  };
});
angular.module('tasks').service('Uuid', function Uuid() {
  return {
    s4: function () {
      return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    },
    randomUuid: function () {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }
  };
});'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);