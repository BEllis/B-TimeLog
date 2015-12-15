        var mainApp = angular.module("myapp", [])

        mainApp.value('selectedDay', '08/12/2015');

        var formatDuration = function(value) {
          if (value <= 0) {
            return ''
          }

          var hours = Math.floor((value / 60 / 60));
          var minutes = Math.floor((value / 60) - (hours * 60));

          if (hours == 0) {
            return '' + minutes + 'm';
          } else if (minutes == 0) {
            return '' + hours + 'h';
          } else {
            return '' + hours + 'h ' + minutes + 'm';
          }
        }

        var parseDuration = function(ngModel, value) {
          var validInput = /^(([1-9][0-9]*|0)[Hh][\s]*(([1-5][0-9]|[0-9])[mM]){0,1}|([1-9][0-9]*|0)[mM]|)$/.test(value);
          ngModel.$setValidity('invalidDuration', validInput);

          if (value == '') {
            return 0;
          }

          if (!validInput) {
            return value;
          }

          value = value.toLowerCase();
          var hours = 0;
          var minutes = 0;
          if (value.indexOf('h') >= 0) {
            hours = Math.floor(value.slice(0, value.indexOf('h')).trim());
            if (value.indexOf('m') >= 0) {
              minutes = Math.floor(value.slice(value.indexOf('h') + 1, value.indexOf('m')).trim());
            }
          } else if (value.indexOf('m') >= 0) {
            minutes = Math.floor(value.slice(0, value.indexOf('m')).trim());
          }

          return (hours * 60 * 60) + (minutes * 60)
        }

        var formatTime = function(value) {
          var hours = Math.floor((value / 60 / 60 / 1000));
          var minutes = Math.floor((value / 60 / 1000) - (hours * 60));
          if (hours + minutes == 0) {
            return ''
          }

          return ("00" + hours).slice(-2) + ':' + ("00" + minutes).slice(-2);
        }

        var parseTime = function(ngModel, value) {
          var validInput = /^([0-9]|[01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
          ngModel.$setValidity('invalidTime', validInput);

          if (!validInput) {
            return value;            
          }

          var hours = Math.floor(value.slice(0, value.indexOf(':')));
          var minutes = Math.floor(value.slice(value.indexOf(':') + 1));
          return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000)
        }

        mainApp.directive('timeDuration', function(){
            return{
                restrict: 'A',
                // templateUrl: 'scripts/directives/directive_templates/directive.html',
                require: 'ngModel',
                link: function(scope, element, attr, ngModel){
                    ngModel.$formatters.push(formatDuration);
                    ngModel.$parsers.push(function(value) { return parseDuration(ngModel, value); });
                }
            };
        });

        mainApp.directive('time', function(){
            return{
                restrict: 'A',
                // templateUrl: 'scripts/directives/directive_templates/directive.html',
                require: 'ngModel',
                link: function(scope, element, attr, ngModel){

                    ngModel.$formatters.push(formatTime);
                    ngModel.$parsers.push(function(value) { return parseTime(ngModel, value); });

                }
            };
        });

        mainApp.filter('time', function() {
          return function(input) {
            return formatTime(input);
          };
        });

        mainApp.filter('duration', function() {
          return function(input) {
            var result = formatDuration(input);
            if (!result) {
              return '0h 0m'
            }

            return result;
          };
        });

        mainApp.service('WorkLogService', function($interval) {

          var me = this;

          me.worklogentries = [];

          me.addNewItem = function(description, issue, startTime, duration) {
            var newItem = { description: description, issue: issue, startTime: startTime, estimatedStartTime: startTime, duration: duration, estimatedDuration: duration, committed:false, processingState:null };
            me.worklogentries.push(newItem);
            return newItem;
          };

          me.nextStartTimeOrTheTimeNow = Date.now();
          me.durationSinceTheLastWorkLogEntry = 0;

          var tick = function() {
            var thetimenow = Date.now() % (24 * 60 * 60 * 1000);
            if (me.worklogentries.length > 0) {
              me.nextStartTimeOrTheTimeNow = me.worklogentries[me.worklogentries.length - 1].estimatedStartTime;
            } else {
              me.nextStartTimeOrTheTimeNow = thetimenow;
            }

            me.durationSinceTheLastWorkLogEntry = 0;
          }
          tick();
          $interval(tick, 1000);

/*
          this.getExpectedStartTimeFor = function(entry) {
            var entryIndex = $scope.worklogentries.indexOf(entry);
            if (entryIndex = 0) {
              return $scope.thetimenow;
            }

            return $scope.getStartTimeFor(entry);
          }

          $scope.getStartTimeFor = function(entry) {
            if (entry.startTime) {
              return entry.startTime;
            }

            var entryIndex = $scope.worklogentries.indexOf(entry);
            if (entryIndex = 0) {
              return $scope.thetimenow;
            }            

            var previousWorkLogEntry = $scope.worklogentries[entryIndex - 1];
            var previousStartTime = $scope.getStartTimeFor(previousWorkLogEntry);
            var previousDuration = $scope.getDurationFor(previousWorkLogEntry);
            return previousStartTime + previousDuration;
          }

          $scope.getDurationFor = function(entry) {
            return 3600;
          } */

        });

        mainApp.controller("WorkLogDayController", function($scope, WorkLogService, selectedDay) {

          if (selectedDay = '08/12/2015') {
            $scope.worklogentries = WorkLogService.worklogentries;
          };

          $scope.durationSinceTheLastWorkLogEntry = WorkLogService.durationSinceTheLastWorkLogEntry;
          $scope.nextStartTimeOrTheTimeNow = WorkLogService.nextStartTimeOrTheTimeNow;

          function resetNewItem() {
            $scope.newItemDescription = '';
            $scope.newItemIssue = '';
            $scope.newItemStartTime = 0;
            $scope.newItemDuration = 0;
          }

          resetNewItem();

          function moveFocus(item) { 
            setTimeout(function() {
              if ($('.newEntry .item-description input:focus').length > 0) {
                $('.item:last .item-description input').focus();
              };
              if ($('.newEntry .item-issue input:focus').length > 0) {
                $('.item:last .item-issue input').focus();
              };
              if ($('.newEntry .item-start-time input:focus').length > 0) {
                $('.item:last .item-start-time input').focus();
              };
              if ($('.newEntry .item-duration input:focus').length > 0) {
                $('.item:last .item-duration input').focus();
              };
            }, 50);
          }

          $scope.edit = function(worklogentry) {
            worklogentry.committed = false;
          };

          $scope.delete = function(worklogentry) {
            worklogentry.processingState = 'Deleting...'
            setTimeout(function() { 
              if ($scope.worklogentries.indexOf(worklogentry) >= 0) {
                $scope.worklogentries.splice($scope.worklogentries.indexOf(worklogentry), 1);
              }

              worklogentry.processingState = null;
            }, 3000);
          };

          $scope.commit = function(entryForm, worklogentry) {
            if (!entryForm.$valid) {
              return;
            }

            worklogentry.processingState = 'Committing...'

            setTimeout(function() { 
              worklogentry.committed = true;
              worklogentry.processingState = null;
            }, 3000);
          };

          $scope.checkForNewEntry = function() {
            if ($scope.newItemDescription != '' || $scope.newItemIssue != '' || $scope.newItemStartTime != 0 || $scope.newItemDuration != 0) {
              var newItem = WorkLogService.addNewItem($scope.newItemDescription, $scope.newItemIssue, $scope.newItemStartTime, $scope.newItemDuration);
              resetNewItem();
              moveFocus(newItem);
            };
          };

        });

        mainApp.controller("TimeController", function($scope, $interval) {

          var tick = function() {
            $scope.thetimenow = Date.now();
          }
          tick();
          $interval(tick, 250);

        });