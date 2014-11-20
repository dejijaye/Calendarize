'use strict';

// Tasks controller
angular.module('tasks')
    .controller('TasksController', ['$http', '$scope', '$stateParams', '$location', '$timeout', 'Authentication', 'Uuid', 'Sample', 'moment', 'GANTT_EVENTS', '$modal', 'Persons', 'Projects', 'Tasks','switchViews',
        function($http, $scope, $stateParams, $location, $timeout, Authentication, Uuid, Sample, moment, GANTT_EVENTS, $modal, Persons, Projects, Tasks, switchViews) {

            $scope.authentication = Authentication;
            var assignment = {};
            $scope.openProject = function(size) {
                var modalInstance = $modal.open({
                    templateUrl: 'projectModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'sm',
                    resolve: {
                        projects: function() {
                            return $scope.projects;
                        }
                    }
                });
                modalInstance.result.then(function(data) {
                    if (switchViews.myView === 'Person') {
                        assignment.projectId = data._id;
                        assignment.projectName = data.name;
                    }
                    else {
                        assignment.personId = data._id;
                        assignment.personName = data.name;
                    }

                    $scope.createTask(assignment);
                }, function() {});
            };

            // Find a list of Persons
            $scope.findPersons = function() {
                var personData = [];
                $scope.persons = Persons.query({}, function() {
                    $scope.persons.forEach(function(user) {
                        var $user = {};
                        $user.tasks = [];
                        $user.id = user._id;
                        $user.name = user.name;
                        user.tasks.forEach(function(task) {
                            var $task = {};
                            $task.id = task._id;
                            $task.name = task.projectName;
                            $task.from = task.startDate;
                            $task.to = task.endDate;
                            $task.color = '#F1C232';
                            $user.tasks.push($task);
                        });

                        personData.push($user);
                    });
                    $scope.loadData(personData);
                });
            };
            // Find a list of Projects
            $scope.listProjects = function() {
                var projectData = [];
                $scope.projects = Projects.query({}, function() {
                    $scope.projects.forEach(function(assign) {
                        var $project = {};
                        $project.tasks = [];
                        $project.id = assign._id;
                        $project.name = assign.name;
                        assign.tasks.forEach(function(task) {
                            var $user = {};
                            $user.id = task._id;
                            $user.name = task.personName;
                            $user.from = task.startDate;
                            $user.to = task.endDate;
                            $user.color = '#F1C232';
                            $project.tasks.push($user);
                        });

                        projectData.push($project);
                    });
                    $scope.loadData(projectData);
                });
            };

            /************************************************
            TASK CRUD
            ************************************************/
            // Creating a new Assignment/Task
            $scope.createTask = function(data) {
                console.log(data);
                var newTask = {
                    personId: data.personId,
                    projectId: data.projectId,
                    startDate: data.startDate,
                    endDate: data.endDate
                };
                var task = new Tasks(newTask);
                task.$save(function(response) {
                    console.log(response);
                    var taskParam = {
                        id: response._id, //projectId, //_id
                        from: response.startDate,
                        to: response.endDate,
                        color: '#F1C232'
                    };
                    if (switchViews.myView === 'Person') {
                        taskParam.name = response.projectName;
                    }
                    else {
                        taskParam.name = response.personName;
                    }
                    
                    var uiItem = data.infoData.row.addTask(taskParam);
                    uiItem.updatePosAndSize();
                    uiItem.row.updateVisibleTasks();
                    //learn about $scope.apply
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.findOneTask = function() {
                $scope.task = Tasks.get({
                    taskId: $stateParams.taskId
                });
            };

            $scope.updateTask = function(event, data) {
                var task = Tasks.get({
                    taskId: data.task.id
                });
                task._id = data.task.id;
                task.startDate = data.task.from;
                task.endDate = data.task.to;
                console.log(task, task.startDate, task.endDate);
                task.$update(function() {
                    //alert('Updated Successfully taskId');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.findTasks = function() {
                $scope.tasks = Tasks.query();
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
                readOnly: false,
                filterTask: undefined,
                filterRow: undefined,
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
                        $scope.options.headersFormats = {
                            'quarter': '[Q]Q YYYY'
                        };
                        $scope.options.headers = ['quarter'];
                    } else {
                        $scope.options.headersFormats = undefined;
                        $scope.options.headers = undefined;
                    }
                }
            });

            // function that trigers modal onclick on the gantt chart cells 
            $scope.$on(GANTT_EVENTS.ROW_CLICKED, function(event, data) {
                console.log('test');
            });

            $scope.$on(GANTT_EVENTS.READY, function() {
                $scope.addSamples();
                $timeout(function() {
                    $scope.scrollToDate($scope.options.currentDateValue);
                }, 0, true);
            });

            $scope.addSamples = function() {
                $scope.loadTimespans(Sample.getSampleTimespans().timespan1);
                // $scope.loadData(Sample.getSampleData().data1);
                $scope.loadData($scope.findPersons());

            };
            $scope.loadProjectsData = function(){
                switchViews.myView = 'Project';
                $scope.clearData();
                $scope.loadData($scope.listProjects());            
            };

            $scope.loadPersonsData = function(){
                switchViews.myView = 'Person';
                $scope.clearData();
                $scope.loadData($scope.findPersons());
            };

            $scope.removeSomeSamples = function() {
                $scope.removeData([

                ]);
            };

            $scope.removeSamples = function() {
                $scope.clearData();
            };

            var handleClickEvent = function(event, data) {
                console.log(data);
                if (switchViews.myView === 'Person') {
                    assignment.personId = data.row.id;
                }
                else {
                    assignment.projectId = data.row.id;
                }
                $scope.openProject();
                if ($scope.options.draw) {
                    // Example to draw task inside row
                    if ((data.evt.target ? data.evt.target : data.evt.srcElement).className.indexOf('gantt-row') > -1) {
                        // var startDate = data.date;
                        // var endDate = moment(startDate).add( 7, 'd');
                        assignment.startDate = data.date;
                        assignment.endDate = moment(data.date).add(7, 'd');

                        assignment.infoData = data;
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
                    } else if (property === 'row') {
                        propertyValue = propertyValue.name;
                    } else if (property === 'date') {
                        propertyValue = propertyValue.format();
                    }
                    output += property + ': ' + propertyValue + '; ';
                }
                console.log('$scope.$on: ' + event.name + ': ' + output);
            };
            $scope.$on(GANTT_EVENTS.TASK_CLICKED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_DBL_CLICKED, function(event, data) {
                data.task.row.removeTask(data.task.id);
                Tasks.delete({taskId: data.task.id});
            });
            $scope.$on(GANTT_EVENTS.TASK_CONTEXTMENU, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_ADDED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_CHANGED, function(event, data) {
                $scope.updateTask(data)
            });
            $scope.$on(GANTT_EVENTS.TASK_REMOVED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_MOVE_BEGIN, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_MOVE, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_MOVE_END, function(event, data) {});
            // update tasks
            $scope.$on(GANTT_EVENTS.TASK_RESIZE_BEGIN, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_RESIZE, logTaskEvent);
            $scope.$on(GANTT_EVENTS.TASK_RESIZE_END, $scope.updateTask);

            $scope.$on(GANTT_EVENTS.COLUMN_CLICKED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.COLUMN_DBL_CLICKED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.COLUMN_CONTEXTMENU, logTaskEvent);

            $scope.$on(GANTT_EVENTS.ROW_MOUSEDOWN, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_MOUSEUP, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_CLICKED, handleClickEvent);

            $scope.$on(GANTT_EVENTS.ROW_DBL_CLICKED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_CONTEXTMENU, logTaskEvent);

            $scope.$on(GANTT_EVENTS.ROW_ORDER_CHANGED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_CHANGED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_ADDED, logTaskEvent);
            $scope.$on(GANTT_EVENTS.ROW_REMOVED, logTaskEvent);

            $scope.$on(GANTT_EVENTS.ROW_MOUSEDOWN, logTaskEvent);

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
                console.log('$scope.$on: ' + event.name + ': ' + data.filteredRows.length + '/' + data.rows.length + ' rows displayed.');
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
                return {};
            },
            getSampleTimespans: function() {
                return {
                    'timespan1': [{
                        id: '1',
                        from: new Date(2014, 9, 21, 8, 0, 0),
                        to: new Date(2014, 11, 25, 15, 0, 0),
                        name: 'Sprint 1 Timespan'
                            //priority: undefined,
                            //classes: [], //Set custom classes names to apply to the timespan.
                            //data: undefined
                    }]
                };
            },
        };
    })
    .controller('ModalInstanceCtrl', function($rootScope, $scope, $modalInstance, Projects, Persons, switchViews) {

        // Find a list of Persons
        if(switchViews.myView === 'Project'){
            $scope.findData = function() {
                $scope.datas = Persons.query();
            };
        }
        else if (switchViews.myView === 'Person') {
            $scope.findData = function() {
                $scope.datas = Projects.query();
            };   
        }
        $scope.selectedData = function(data) {
            $modalInstance.close(data);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });