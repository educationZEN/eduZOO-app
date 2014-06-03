angular.module("eduZOO", [])
.directive("quiz", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {},
        /* Note: due to security restrictions in Firefox and Chrome loading templates by  */
        /* (relative) URL doesn't work when page is loaded via file: (in Safari it works) */
        template: "<div ng-transclude></div><button ng-click=\"checkAnswers()\">Antwort prüfen</button>" +
            "<img ng-show=\"resolution != undefined\" ng-src=\"{{imagesBasePath() + (resolution ? 'correct.png' : 'wrong.png')}}\">",
        controller: function($scope, eduUtils) {

            var answers = []

            this.addAnswer = function(scope) {
                answers.push(scope)
            }

            // called from "textinput" child view (when pressing Return in the input field)
            this.checkAnswers = function() {
                checkAnswers()
            }

            // called from this "quiz" view (when clicking the "Prüfen" button)
            $scope.checkAnswers = function() {
                checkAnswers()
            }

            function checkAnswers() {
                var resolution = true
                angular.forEach(answers, function(answer) {
                    if (!checkAnswer(answer)) {
                        resolution = false
                    }
                })
                $scope.resolution = resolution
            }

            function checkAnswer(answer) {
                if (answer.text != undefined) {
                    // text input
                    return new RegExp("^" + answer.correct + "$", "i").test(answer.text)
                } else {
                    // multiple choice
                    return (answer.correct == "") == answer.checked
                }
            }

            // ---

            $scope.imagesBasePath = function() {
                return eduUtils.path("eduZOO-app/images/")
            }
        }
    }
})
.directive("choice", function() {
    return {
        require: "^quiz",
        restrict: "E",
        transclude: true,
        scope: {
            correct: "@"
        },
        template: "<br /><input type='checkbox' ng-model='checked' ng-init='checked=false'> <span ng-transclude></span>",
        link: function(scope, element, attrs, controller) {
            controller.addAnswer(scope)
        }
    }
})
.directive("textinput", function() {
    return {
        require: "^quiz",
        restrict: "E",
        scope: {
            correct: "@"
        },
        template: "<br /><input type='text' ng-model='text' ng-init='text=\"\"' ng-keypress='handleKey($event.keyCode)'>",
        link: function(scope, element, attrs, controller) {
            controller.addAnswer(scope)
            scope.handleKey = function(keyCode) {    
                if (keyCode == 13) {
                    controller.checkAnswers()
                }
            }
        }
    }
})
.directive("tex", function() {
    return {
        restrict: "E",
        link: function(scope, element, attrs, controller) {
            var texElem = element[0]
            if (attrs.inline == undefined) {
                texElem.textContent = "$$" + texElem.textContent + "$$"
            } else {
                texElem.textContent = "\\(" + texElem.textContent + "\\)"
            }
        }
    }
})
.service("eduUtils", function() {
    this.path = function(relPath) {
        return repeat("../", dirLevel()) + relPath
    }

    function dirLevel() {
        var INSTALL_DIR = "/eduZOO";
        var path = location.pathname
        var i = path.lastIndexOf(INSTALL_DIR + "/")
        if (i == -1) {
            throw "installation directory \"" + INSTALL_DIR + "/\" not found in \"" + path + "\""
        }
        var localPath = path.substr(i + INSTALL_DIR.length)
        var matches = localPath.match(/\//g)
        if (!matches) {
            throw "\"/\" not found in local path \"" + localPath + "\""
        }
        var dirLevel = matches.length
        return dirLevel
    }

    function repeat(string, times) {
        var s = ""
        for (var i = 0; i < times; i++) {
            s += string
        }
        return s
    }
})
.run(function(eduUtils) {
    // load stylesheet
    var link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = eduUtils.path("eduZOO/css/eduZOO.css")
    document.head.appendChild(link)
})
