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
            if (attrs.p != undefined) {
                texElem.textContent = "$$" + texElem.textContent + "$$"
            } else {
                texElem.textContent = "\\(" + texElem.textContent + "\\)"
            }
        }
    }
})
.service("eduUtils", function() {

    this.loadScript = function(path) {
        var script = document.createElement("script")
        script.src = this.path(path)
        document.head.appendChild(script)
    }

    this.loadStylesheet = function(path) {
        var link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = this.path(path)
        document.head.appendChild(link)
    }

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
    eduUtils.loadStylesheet("eduZOO/css/eduZOO.css")
    eduUtils.loadScript("eduZOO-app/script/lib/MathJax/MathJax.js?config=TeX-AMS_HTML")
    //
    addFacebookComments()
    addGoogleAnalytics()

    function addFacebookComments() {
        loadFbSDK()
        createFbRootDiv()
        createFbCommentsWidget()

        function loadFbSDK() {
            (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0&appId=1513418668879103";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }

        function createFbRootDiv() {
            var div = document.createElement("div")
            div.id = "fb-root"
            displayAlign: "center"
            document.body.appendChild(div)
        }

        function createFbCommentsWidget() {
            var div = document.createElement("div")
            div.setAttribute("class", "fb-comments")
            div.setAttribute("data-href", location.href)
            document.body.appendChild(div)
        }
    }

    function addGoogleAnalytics() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        //
        var WEB_PROPERTY_ID = "UA-51564469-1"
        ga('create', WEB_PROPERTY_ID, 'auto');  // create tracking object
        ga('send', 'pageview');                 // track pageview
    }
})
