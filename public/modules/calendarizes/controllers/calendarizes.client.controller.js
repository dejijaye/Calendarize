'use strict';

// Calendarizes controller
angular.module('calendarizes').controller('CalendarizesController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', 'Apicall', 'Uuid', 'Sample', 'moment', 'GANTT_EVENTS',
	function($scope, $stateParams, $location, $timeout, Authentication, Apicall, Uuid, Sample, moment, GANTT_EVENTS ) {

		$scope.authentication = Authentication;

        $scope.addPerson = function() {
            var person = new Apicall.Persons($scope.person);

            person.$save(function(response) {
                $scope.msg = 'Person Successfully added';
                $scope.person = '';
                var newData = [
                    {'id': response._id, 'name': response.name, 'tasks': []}
                ];
                $scope.loadData(newData);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
		$scope.removePerson = function( person ) {
			if ( person ) { person.$remove();

				for (var i in $scope.persons) {
					if ($scope.persons [i] === person ) {
						$scope.persons.splice(i, 1);
					}
				}
			} else {
				$scope.person.$remove(function() {
				});
			}
		};

		$scope.updatePerson = function() {
			var person = $scope.person ;

			person.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};			

		// Find a list of Persons
		$scope.findPersons = function() {

    		$scope.persons = Apicall.Persons.query({}, function(){
                  $scope.persons.forEach(function(result){
                        console.log(result);
                // $scope.loadData(result);                        
                    });
            });
        };

		// Find existing Person
		$scope.findOnePerson = function() {
			$scope.person = Apicall.Persons.get({ 
				personId: $stateParams.personId
			});
		};


		/************************************************
					PROJECTS CRUD
		************************************************/

		// Creating a new Project
		$scope.addProject = function() {
			// Create new Calendarize object
			console.log('fired');
			var project = new Apicall.Projects ($scope.project);
			console.log($scope.project);
			console.log(project);
			// Redirect after save
			project.$save(function(response) {
				console.log('Project Successfully added');
					console.log(response);
				// Clear form fields
				$scope.project = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
		// Remove existing Project
		$scope.removeProject = function(project) {
			if (project) { project.$remove();

				for (var i in $scope.projects) {
					if ($scope.projects [i] === project ) {
						$scope.projects.splice(i, 1);
					}
				}
			} else {
				$scope.project.$remove(function() {
				});
			}
		};

		// Update existing Calendarize
		$scope.updateProject = function() {
			var project = $scope.project ;

			project.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};			

		// Find a list of Persons
		$scope.findProjects = function() {
            console.log(5555);
			$scope.projects = Apicall.Projects.query();

		};


        //populate select option
        $scope.projectlist = {};

		// Find existing Person
		$scope.findOneProject = function() {
			$scope.project = Apicall.Projects.get({ 
				projectId: $stateParams.projectId
			});
		};

            /************************************************
                    ASSIGNMENT CRUD
        ************************************************/
        // Creating a new Assignment
        $scope.createTask = function() {
            var task = new Apicall.Tasks ($scope.task);
            task.$save(function(response) {
                $scope.task = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.findOneTask = function() {
            $scope.task = Apicall.Tasks.get({ 
                // assignmentId: $stateParams.assignmentId
            });
        };
        $scope.updateTask = function() {
            var task = $scope.task ;

            task.$update(function() {
                // $location.path('calendarizes/' + calendarize._id);
                // Return a "Person updated" success message
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.findTasks = function() {
            $scope.tasks = Apicall.Tasks.query();
        };


		/************************************************
					TIMELIME
		************************************************/

		$scope.options = {
            mode: 'custom',
            scale: 'day',
            maxHeight: false,
            width: false,
            autoExpand: 'both',
            taskOutOfRange: 'expand',
            fromDate: undefined,
            toDate: undefined,
            showLabelsColumn: true,
            currentDate: 'line',
            currentDateValue : new Date(2014, 9, 23, 11, 20, 0),
            draw: false,
            readOnly: false,
            filterTask: undefined,
            filterRow: undefined,
            allowLabelsResizing: true,
            timeFrames:
                 {'day': {
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
                 'weekend': {
                     working: false
                 }
                },
            dateFrames: {
                'weekend': {
                    evaluator: function(date) {
                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                }
            },
            timeFramesNonWorkingMode: 'visible',
            columnMagnet: '5 minutes'
        };

        $scope.$watch('fromDate+toDate', function() {
            $scope.options.fromDate = $scope.fromDate;
            $scope.options.toDate = $scope.toDate;
        });

        $scope.$watch('options.scale', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue === 'quarter') {
                    $scope.options.headersFormats = {'quarter': '[Q]Q YYYY'};
                    $scope.options.headers = ['quarter'];
                } else {
                    $scope.options.headersFormats = undefined;
                    $scope.options.headers = undefined;
                }
            }
        });

        $scope.$on(GANTT_EVENTS.READY, function() {
            $scope.addSamples();
            $timeout(function() {
                $scope.scrollToDate($scope.options.currentDateValue);
            }, 0, true);
        });

        $scope.addSamples = function() {
            $scope.loadTimespans(Sample.getSampleTimespans().timespan1);
            $scope.loadData(Sample.getSampleData().data1);

        }; 

        $scope.removeSomeSamples = function() {
            $scope.removeData([
                {'id': 'c65c2672-445d-4297-a7f2-30de241b3145'}, // Remove all Kickoff meetings
                {'id': '2f85dbeb-0845-404e-934e-218bf39750c0', 'tasks': [
                    {'id': 'f55549b5-e449-4b0c-9f4b-8b33381f7d76'},
                    {'id': '5e997eb3-4311-46b1-a1b4-7e8663ea8b0b'},
                    {'id': '6fdfd775-7b22-42ec-a12c-21a64c9e7a9e'}
                ]}, // Remove some Milestones
                {'id': 'cfb29cd5-1737-4027-9778-bb3058fbed9c', 'tasks': [
                    {'id': '57638ba3-dfff-476d-ab9a-30fda1e44b50'}
                ]} // Remove order basket from Sprint 2
            ]);
        };

        $scope.removeSamples = function() {
            $scope.clearData();
        };

        var rowEvent = function(event, data) {
            if (!$scope.options.readOnly && $scope.options.draw) {
                // Example to draw task inside row
                if ((data.evt.target ? data.evt.target : data.evt.srcElement).className.indexOf('gantt-row') > -1) {
                    var startDate = data.date;
                    var endDate = moment(startDate);
                    //endDate.setDate(endDate.getDate());
                    var infoTask = {
                        id: Uuid.randomUuid(),  // Unique id of the task.
                        name: 'Drawn task', // Name shown on top of each task.
                        from: startDate, // Date can be a String, Timestamp or Date object.
                        to: endDate,// Date can be a String, Timestamp or Date object.
                        color: '#AA8833' // Color of the task in HEX format (Optional).
                    };
                    var task = data.row.addTask(infoTask);
                    task.isCreating = true;
                    $scope.$apply(function() {
                        task.updatePosAndSize();
                        data.row.updateVisibleTasks();
                    });
                }
            }
        };

        var logScrollEvent = function(event, data) {
            if (angular.equals(data.direction, 'left')) {
                // Raised if the user scrolled to the left side of the Gantt. Use this event to load more data.
                console.log('Scroll event: Left ' + data.left);
            } else if (angular.equals(data.direction, 'right')) {
                // Raised if the user scrolled to the right side of the Gantt. Use this event to load more data.
                console.log('Scroll event: Right');
            }
        };

        var logTaskEvent = function(event, data) {
            // A task event has occured.
            var output = '';
            for (var property in data) {
                var propertyValue = data[property];
                if (property === 'evt' && propertyValue) {
                    propertyValue = propertyValue.type;
                } else if (property === 'element' && propertyValue.length > 0) {
                    propertyValue = propertyValue[0].localName + (propertyValue[0].className ? '.' + propertyValue[0].className : '');
                } else if (property === 'task') {
                    propertyValue = propertyValue.name;
                } else if (property === 'timespan') {
                    propertyValue = propertyValue.name;
                } else if (property === 'column') {
                    propertyValue = propertyValue.date.format() + ' <---> ' + propertyValue.endDate.format();
                }  else if (property === 'row') {
                    propertyValue = propertyValue.name;
                } else if (property === 'date') {
                    propertyValue = propertyValue.format();
                }
                output += property + ': ' + propertyValue +'; ';
            }
            console.log('$scope.$on: ' + event.name + ': ' + output);
        };

        $scope.$on(GANTT_EVENTS.TASK_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_DBL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_CONTEXTMENU, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_ADDED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_CHANGED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_REMOVED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_MOVE_BEGIN, logTaskEvent);
        //$scope.$on(GANTT_EVENTS.TASK_MOVE, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_MOVE_END, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_RESIZE_BEGIN, logTaskEvent);
        //$scope.$on(GANTT_EVENTS.TASK_RESIZE, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TASK_RESIZE_END, logTaskEvent);

        $scope.$on(GANTT_EVENTS.COLUMN_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.COLUMN_DBL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.COLUMN_CONTEXTMENU, logTaskEvent);

        $scope.$on(GANTT_EVENTS.ROW_MOUSEDOWN, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_MOUSEUP, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_DBL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_CONTEXTMENU, logTaskEvent);

        $scope.$on(GANTT_EVENTS.ROW_ORDER_CHANGED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_CHANGED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_ADDED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_REMOVED, logTaskEvent);

        $scope.$on(GANTT_EVENTS.ROW_MOUSEDOWN, rowEvent);

        $scope.$on(GANTT_EVENTS.ROW_LABEL_MOUSEDOWN, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_LABEL_MOUSEUP, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_LABEL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_LABEL_DBL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_LABEL_CONTEXTMENU, logTaskEvent);

        $scope.$on(GANTT_EVENTS.ROW_HEADER_MOUSEDOWN, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_HEADER_MOUSEUP, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_HEADER_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_HEADER_DBL_CLICKED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.ROW_HEADER_CONTEXTMENU, logTaskEvent);

        $scope.$on(GANTT_EVENTS.ROW_LABELS_RESIZED, logTaskEvent);

        $scope.$on(GANTT_EVENTS.TIMESPAN_ADDED, logTaskEvent);
        $scope.$on(GANTT_EVENTS.TIMESPAN_CHANGED, logTaskEvent);

        $scope.$on(GANTT_EVENTS.READY, logTaskEvent);
        $scope.$on(GANTT_EVENTS.SCROLL, logScrollEvent);

        $scope.$on(GANTT_EVENTS.ROWS_FILTERED, function(event, data) {
            console.log(data);
            console.log('$scope.$on: ' + event.name + ': ' + data.filteredRows.length + '/' +  data.rows.length + ' rows displayed.');
        });
        $scope.$on(GANTT_EVENTS.TASKS_FILTERED, function(event, data) {
            console.log('$scope.$on: ' + event.name + ': ' + data.filteredTasks.length + '/' + data.tasks.length + ' tasks displayed.');
        });

	}
])
.service('Uuid', function Uuid() {
    return {
        s4: function() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        },
        randomUuid: function() {
            return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
                this.s4() + '-' + this.s4() + this.s4() + this.s4();
        }
    };
})
.service('Sample', function Sample() {
    return {
        getSampleData: function() {
            return {
                'data1': [
                    // Order is optional. If not specified it will be assigned automatically
                    {'id': '2f85dbeb-0845-404e-934e-218bf39750c0', 'name': 'Jide', 'order': 0, 'tasks': [
                        // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
                        {'id': 'f55549b5-e449-4b0c-9f4b-8b33381f7d76', 'name': 'backend Development', 'color': '#93C47D', 'from': '2014-10-07T09:00:00', 'to': '2014-10-07T10:00:00', 'data': 'Can contain any custom data or object'},
                        {'id': '5e997eb3-4311-46b1-a1b4-7e8663ea8b0b', 'name': 'Concept approval', 'color': '#93C47D', 'from': new Date(2014, 9, 18, 18, 0, 0), 'to': new Date(2014, 9, 18, 18, 0, 0), 'est': new Date(2014, 9, 16, 7, 0, 0), 'lct': new Date(2014, 9, 19, 0, 0, 0)},
                        {'id': 'b6a1c25c-85ae-4991-8502-b2b5127bc47c', 'name': 'Development finished', 'color': '#93C47D', 'from': new Date(2014, 10, 15, 18, 0, 0), 'to': new Date(2014, 10, 15, 18, 0, 0)},
                        {'id': '6fdfd775-7b22-42ec-a12c-21a64c9e7a9e', 'name': 'TimelineDesign', 'color': '#93C47D', 'from': new Date(2014, 10, 22, 12, 0, 0), 'to': new Date(2014, 10, 22, 12, 0, 0)},
                        {'id': 'c112ee80-82fc-49ba-b8de-f8efba41b5b4', 'name': 'Go-live', 'color': '#93C47D', 'from': new Date(2014, 10, 29, 16, 0, 0), 'to': new Date(2014, 10, 29, 16, 0, 0)}
                    ], 'data': 'Can contain any custom data or object'},
                    {'id': 'b8d10927-cf50-48bd-a056-3554decab824', 'name': 'Sola', 'order': 1, 'tasks': [
                        {'id': '301d781f-1ef0-4c35-8398-478b641c0658', 'name': 'SignUpStyling', 'color': '#9FC5F8', 'from': new Date(2014, 9, 25, 15, 0, 0), 'to': new Date(2014, 9, 25, 18, 30, 0)},
                        {'id': '0fbf344a-cb43-4b20-8003-a789ba803ad8', 'name': 'SignInStyling', 'color': '#9FC5F8', 'from': new Date(2014, 10, 1, 15, 0, 0), 'to': new Date(2014, 10, 1, 18, 0, 0)},
                        {'id': '12af138c-ba21-4159-99b9-06d61b1299a2', 'name': 'HomepageStyling', 'color': '#9FC5F8', 'from': new Date(2014, 10, 8, 15, 0, 0), 'to': new Date(2014, 10, 8, 18, 0, 0)},
                        {'id': '73294eca-de4c-4f35-aa9b-ae25480967ba', 'name': 'HeaderStyling', 'color': '#9FC5F8', 'from': new Date(2014, 10, 15, 15, 0, 0), 'to': new Date(2014, 10, 15, 18, 0, 0)},
                        {'id': '75c3dc51-09c4-44fb-ac40-2f4548d0728e', 'name': 'AllStyling', 'color': '#9FC5F8', 'from': new Date(2014, 10, 24, 9, 0, 0), 'to': new Date(2014, 10, 24, 10, 0, 0)}
                    ]},
                    {'id': 'c65c2672-445d-4297-a7f2-30de241b3145', 'name': 'Atuma', 'order': 2, 'tasks': [
                        {'id': '4e197e4d-02a4-490e-b920-4881c3ba8eb7', 'name': 'Research', 'color': '#F1C232', 'from': new Date(2014, 9, 7, 9, 0, 0), 'to': new Date(2014, 9, 7, 17, 0, 0),
                            'progress': {'percent': 100, 'color': '#3C8CF8'}},
                        {'id': '451046c0-9b17-4eaf-aee0-4e17fcfce6ae', 'name': 'FrontEndDesign', 'color': '#9FC5F8', 'from': new Date(2014, 9, 8, 9, 0, 0), 'to': new Date(2014, 9, 8, 17, 0, 0),
                            'progress': {'percent': 100, 'color': '#3C8CF8'}},
                        {'id': 'fcc568c5-53b0-4046-8f19-265ebab34c0b', 'name': 'FrontEndDesign', 'color': '#9FC5F8', 'from': new Date(2014, 9, 9, 8, 30, 0), 'to': new Date(2014, 9, 9, 12, 0, 0),
                            'progress': {'percent': 100, 'color': '#3C8CF8'}}
                    ]},
                    {'id': 'dd2e7a97-1622-4521-a807-f29960218785', 'name': 'Deji', 'order': 3, 'tasks': [
                        {'id': '9c17a6c8-ce8c-4426-8693-a0965ff0fe69', 'name': 'Create concept', 'color': '#F1C232', 'from': new Date(2014, 9, 10, 8, 0, 0), 'to': new Date(2014, 9, 16, 18, 0, 0), 'est': new Date(2014, 9, 8, 8, 0, 0), 'lct': new Date(2014, 9, 18, 20, 0, 0),
                            'progress': 100}
                    ]}
                    // {'id': 'eede0c9a-6777-4b55-9359-1eada309404e', 'name': 'Finalize concept', 'order': 4, 'tasks': [
                    //     {'id': '30b8f544-5a45-4357-9a72-dd0181fba49f', 'name': 'Finalize concept', 'color': '#F1C232', 'from': new Date(2013, 9, 17, 8, 0, 0), 'to': new Date(2013, 9, 18, 18, 0, 0),
                    //         'progress': 100}
                    // ]},
                    // {'id': 'b5318fd9-5d70-4eb1-9c05-65647b9aefe6', 'name': 'Sprint 1', 'order': 5, 'tasks': [
                    //     {'id': 'd1fdf100-534c-4198-afb9-7bcaef0696f0', 'name': 'Product list view', 'color': '#F1C232', 'from': new Date(2013, 9, 21, 8, 0, 0), 'to': new Date(2013, 9, 25, 15, 0, 0),
                    //         'progress': 25}
                    // ]},
                    // {'id': 'cfb29cd5-1737-4027-9778-bb3058fbed9c', 'name': 'Sprint 2', 'order': 6, 'tasks': [
                    //     {'id': '57638ba3-dfff-476d-ab9a-30fda1e44b50', 'name': 'Order basket', 'color': '#F1C232', 'from': new Date(2013, 9, 28, 8, 0, 0), 'to': new Date(2013, 10, 1, 15, 0, 0)}
                    // ]},
                    // {'id': 'df9bb83f-e9de-4cbe-944e-36aec6db53cc', 'name': 'Sprint 3', 'order': 7, 'tasks': [
                    //     {'id': '192adc6e-ab17-4cd1-82d8-4a5e7525b169', 'name': 'Checkout', 'color': '#F1C232', 'from': new Date(2013, 10, 4, 8, 0, 0), 'to': new Date(2013, 10, 8, 15, 0, 0)}
                    // ]},
                    // {'id': '48cbc052-1fd5-4262-a05f-97dad7337876', 'name': 'Sprint 4', 'order': 8, 'tasks': [
                    //     {'id': '431dc7be-b61b-49a0-b26d-7ab5dfcadd41', 'name': 'Login&Singup and admin view', 'color': '#F1C232', 'from': new Date(2013, 10, 11, 8, 0, 0), 'to': new Date(2013, 10, 15, 15, 0, 0)}
                    // ]},
                    // {'id': '34473cc4-5ee5-4953-8289-98779172129e', 'name': 'Setup server', 'order': 9, 'tasks': [
                    //     {'id': '43eb6d19-6402-493c-a281-20e59a6fab6e', 'name': 'HW', 'color': '#F1C232', 'from': new Date(2013, 10, 18, 8, 0, 0), 'to': new Date(2013, 10, 18, 12, 0, 0)}
                    // ]},
                    // {'id': '73cae585-5b2c-46b6-aeaf-8cf728c894f7', 'name': 'Config server', 'order': 10, 'tasks': [
                    //     {'id': '8dbfda29-e775-4fa3-87c1-103b085d52ee', 'name': 'SW / DNS/ Backups', 'color': '#F1C232', 'from': new Date(2013, 10, 18, 12, 0, 0), 'to': new Date(2013, 10, 21, 18, 0, 0)}
                    // ]},
                    // {'id': '41cae585-ad2c-46b6-aeaf-8cf728c894f7', 'name': 'Deployment', 'order': 11, 'tasks': [
                    //     {'id': '2dbfda09-e775-4fa3-87c1-103b085d52ee', 'name': 'Depl. & Final testing', 'color': '#F1C232', 'from': new Date(2013, 10, 21, 8, 0, 0), 'to': new Date(2013, 10, 22, 12, 0, 0)}
                    // ]},
                    // {'id': '33e1af55-52c6-4ccd-b261-1f4484ed5773', 'name': 'Workshop', 'order': 12, 'tasks': [
                    //     {'id': '656b9240-00da-42ff-bfbd-dfe7ba393528', 'name': 'On-side education', 'color': '#F1C232', 'from': new Date(2013, 10, 24, 9, 0, 0), 'to': new Date(2013, 10, 25, 15, 0, 0)}
                    // ]},
                    // {'id': 'bffa16c6-c134-4443-8e6e-b09410c37c9f', 'name': 'Content', 'order': 13, 'tasks': [
                    //     {'id': '2f4ec0f1-cd7a-441a-8288-e788ec112af9', 'name': 'Supervise content creation', 'color': '#F1C232', 'from': new Date(2013, 10, 26, 9, 0, 0), 'to': new Date(2013, 10, 29, 16, 0, 0)}
                    // ]},
                    // {'id': 'ec0c5e31-449f-42d0-9e81-45c66322b640', 'name': 'Documentation', 'order': 14, 'tasks': [
                    //     {'id': 'edf2cece-2d17-436f-bead-691edbc7386b', 'name': 'Technical/User documentation', 'color': '#F1C232', 'from': new Date(2013, 10, 26, 8, 0, 0), 'to': new Date(2013, 10, 28, 18, 0, 0)}
                    // ]}
                ]};
        },
        getSampleTimespans: function() {
            return {
                'timespan1': [
                    {
                        id: '1',
                        from: new Date(2014, 9, 21, 8, 0, 0),
                        to: new Date(2014, 9, 25, 15, 0, 0),
                        name: 'Sprint 1 Timespan'
                        //priority: undefined,
                        //classes: [], //Set custom classes names to apply to the timespan.
                        //data: undefined
                    }
                ]
            };
        }
    };
});
