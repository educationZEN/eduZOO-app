angular.module("eduZOO", []).directive("quiz", function() {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: "app/templates/quiz.html",
        controller: function($scope) {

            var answers = []

            this.addAnswer = function(scope) {
                answers.push(scope)
            }

            $scope.checkAnswer = function() {
                console.log(answers)
                var resolution = true
                angular.forEach(answers, function(answer) {
                    if (!checkAnswer(answer)) {
                        resolution = false
                    }
                })
                console.log("resolution=" + resolution)
                $scope.resolution = resolution
            }

            function checkAnswer(answer) {
                return (answer.correct == "") == (answer.checked == true)
            }
        }
    }
}).directive("answer", function() {
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
