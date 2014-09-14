/**
 * Created by joshua.hutt on 9/11/2014.
 */
angular.module('joshuathehutt', ['ngRoute', 'ngSanitize']).

    config(function($routeProvider, $locationProvider) {

        $routeProvider.
            when('/blog/:post', {
                templateUrl: 'partials/post.html',
                controller: function($scope, DataSvc, $routeParams, MarkdownSvc) {
                    var shortName = $routeParams.post;
                    DataSvc.getData('blog').then(function(result) {

                        var post;
                        for (var i = 0; i < result.data.length; i++) {
                            if (result.data[i].shortName == shortName) {
                                post = result.data[i];
                                break;
                            }
                        }

                        $scope.data = post;

                    })
                    DataSvc.getBlogEntry(shortName).then(function (result) {
                        $scope.content = MarkdownSvc.convert(result.data);
                    })
                }
            }).
            when('/:shortName?', {
                templateUrl: function (params) {
                    var shortName = params.shortName ? params.shortName : 'home';
                    return 'partials/' + shortName + '.html';
                },
                controller: function ($scope, DataSvc, $routeParams) {
                    var shortName = $routeParams.shortName ? $routeParams.shortName : 'home';
                    DataSvc.getData(shortName).then(function (result) {
                        $scope.data = result.data;
                    });
                }
            });

    }).

    service('MarkdownSvc', function() {
        var converter = new Showdown.converter();

        return {
            convert: function(markdown) {
                return converter.makeHtml(markdown);
            }
        }
    }).

    filter("asDate", function () {
        return function (input) {
            return new Date(input);
        }
    }).

    filter("orderByDate", function () {
        return function(items, field, reverse) {
            if (!items) return items;
            items.sort(function (a, b) {
                return ((new Date(a[field])) > (new Date(b[field])) ? 1 : -1);
            });
            if(reverse) items.reverse();
            return items;
        };
    }).

    service('DataSvc', function($http, $location, $q) {

        // Get the current path, without the file (index.html) or hash
        var rootPath = $location.absUrl();
        if (!!~rootPath.indexOf('#')) {
            rootPath = rootPath.substr(0,rootPath.lastIndexOf('#'));
        }
        rootPath = rootPath.substr(0,rootPath.lastIndexOf('/'));
        rootPath += '/';


        var data = {};
        var blogData = {};
        // Should load from "tableofcontents.json"
        // If 'dataUrl' or 'templateUrl' is not specified,
        // should guess at standard path + shortName
        var _pageList = [
            {
                id: 0,
                name: "Home",
                shortName: "home",
                icon: "home"
            },
            {
                id: 1,
                name: "Portfolio",
                shortName: "portfolio",
                icon: "briefcase"
            },
            {
                id: 2,
                name: "Résumé",
                shortName: "resume",
                icon: "text file outline"
            },
            {
                id: 3,
                name: "Blog",
                shortName: "blog",
                icon: "book"
            }
        ];

        var _pagesByShortName = _pageList.reduce(function(memo, n, i) {
            memo[n.shortName] = _pageList[i];
            return memo;
        }, {});

        var getData = function (shortName) {
            // Load from cache if present
            if (data[shortName]) return data[shortName];

            // If the shortName does not exist
            if (!_pagesByShortName[shortName]) {
                var q = $q.defer();
                q.reject("Page data for '" + shortName + "' not found.");
                return q;
            }

            // Store the page in the cache and pass it to the controller
            // If a dataUrl is specified, use that. Otherwise, guess
            // with the format 'data/shortName.json'
            var path = rootPath;
            if (_pagesByShortName[shortName].dataUrl) {
                path += _pagesByShortName[shortName].dataUrl;
            } else {
                path += 'data/' + shortName + '.json';
            }

            return data[shortName] = $http.get(path);
        };

        var getBlogEntry = function(permalink) {
            if (blogData[permalink]) return blogData[permalink];
            return blogData[permalink] = $http.get(rootPath + 'data/blog/' + permalink + '.md');
        }

        var getTemplateUrl = function(shortName) {
            return _pagesByShortName[shortName].templateUrl || 'partials/' + shortName + '.html';
        }

        var getShortNames = function() {
            return _pageList.sort(function(a, b) {
                return a.id > b.id;
            }).map(function (n) {
                return n.shortName;
            })
        }

        return {
            getData: getData,
            getBlogEntry: getBlogEntry,
            getTemplateUrl: getTemplateUrl,
            getShortNames: getShortNames,
            getPageList: function() {
                return _pageList;
            }
        }
    }).

    // ToDo: Use left/right keypresses to navigate between adjacent pages
    controller('MainCtrl', function ($scope, DataSvc, $location) {

        var find = function(key, value) {
            return function(prev, curr, index, list) {

                return prev[key] == value ? prev : curr;
            }
        }

        var _currentPage = "",
            _pageList    = DataSvc.getPageList(),
            isActive = function(page) {
                return !!~_pageList.indexOf(page) && _currentPage == page;
            },
            setPage = function(page) {
                if (typeof page == "string") {
                    if (page == '') page = 'home';
                    page = _pageList.reduce(find('shortName', page));
                }

                if (!!~_pageList.indexOf(page)) _currentPage = page;
            },
            goToPage = function(page) {
                $location.path('/' + page.shortName);
                setPage(page);
            };


        $scope.keyPress = function(e) {
            switch(e.keyCode) {
                case 37: // left
                    e.preventDefault();
                    var prev = _currentPage.id - 1;
                    if (!~prev) prev = _pageList.length - 1;
                    goToPage(_pageList[prev])
                    break;
                case 39: // right
                    e.preventDefault();
                    var next = _currentPage.id + 1;
                    if (next == _pageList.length) next = 0;
                    goToPage(_pageList[next])
                    break;
            }
        }

        $scope.isActive = isActive;
        $scope.setPage  = setPage;
        $scope.pageList = _pageList;
        $scope.setPage($location.path().replace('/', ''));
        $scope.getDate = function() {
            return (new Date());
        };
    }).

//    controller('HomeCtrl', function($scope, DataSvc) {
//        DataSvc.getData('home').then(function(result) {
//            $scope.data = result.data;
//            // $scope.data.subheading = $scope.data.subheading[Math.round(Math.random())];
//        })
//    }).
//
//    controller('PortfolioCtrl', function($scope, DataSvc) {
//        DataSvc.getData('portfolio').then(function(result) {
//            $scope.data = result.data;
//            // $scope.data.subheading = $scope.data.subheading[Math.round(Math.random())];
//        })
//    }).
//
//
//    controller('ResumeCtrl', function($scope, DataSvc) {
//        DataSvc.getData('resume').then(function(result) {
//            $scope.data = result.data;
//        })
//    }).

    directive('markdown', function () {
        var converter = new Showdown.converter();
        return {
            restrict: 'A',
            link: function parse(scope, element, attrs) {
                  if (scope == undefined || typeof scope.content == 'undefined') {
                      setTimeout(parse.bind(this, scope, element, attrs), 100);
                  } else {
                      var htmlText = converter.makeHtml(scope.content);
                      element.html(htmlText);
                  }
            }
        };
    });