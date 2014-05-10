angular.module("eduZOO", []).directive("quiz", function() {
    return {
        restrict: "E",
        transclude: true,
        template: "<div ng-transclude></div><button ng-click='checkAnswer()'>Antwort prüfen</button>",
        controller: function($scope) {

            var answers = []

            this.addAnswer = function(scope) {
                answers.push(scope)
            }

            $scope.checkAnswer = function() {
                console.log(answers)
                var correct = true
                angular.forEach(answers, function(answer) {
                    if (!checkAnswer(answer)) {
                        correct = false
                    }
                })
                console.log("correct=" + correct)
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
        template: "<br /><input type='checkbox' ng-model='checked'><span ng-transclude></span>",
        link: function(scope, element, attrs, controller) {
            controller.addAnswer(scope)
        }
    }
})