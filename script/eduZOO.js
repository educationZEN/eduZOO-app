angular.module("eduZOO", [])
.directive("quiz", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {},
        template: "<div ng-transclude></div><button ng-click=\"checkAnswer()\">Antwort prüfen</button>" +
            "<img ng-show=\"resolution != undefined\" ng-src=\"{{'../eduZOO-app/images/' + (resolution ? 'correct.png' : 'wrong.png')}}\">",
        controller: function($scope) {

            var answers = []

            this.addAnswer = function(scope) {
                answers.push(scope)
            }

            $scope.checkAnswer = function() {
                var resolution = true
                angular.forEach(answers, function(answer) {
                    if (!checkAnswer(answer)) {
                        resolution = false
                    }
                })
                $scope.resolution = resolution
            }

            function checkAnswer(answer) {
                return (answer.correct == "") == (answer.checked == true)
            }
        }
    }
})
.directive("answer", function() {
    return {
        require: "^quiz",
        restrict: "E",
        transclude: true,
        scope: {
            correct: "@"
        },
        template: "<br /><input type='checkbox' ng-model='checked'> <span ng-transclude></span>",
        link: function(scope, element, attrs, controller) {
            controller.addAnswer(scope)
        }
    }
})
