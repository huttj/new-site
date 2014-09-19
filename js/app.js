/**
 * Created by joshua.hutt on 9/11/2014.
 */
angular.module('joshuathehutt', ['angulartics', 'angulartics.google.analytics', 'ngRoute', 'ngSanitize', 'rt.encodeuri']).

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

                    });
                    DataSvc.getBlogEntry(shortName).then(function (result) {
                        $scope.content = MarkdownSvc.convertAndHighlight(result.data);
                    });
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
                    }).catch(function(e) {
                        $location.redirectTo('/home'); // Todo: Make this work
                    });
                }
            });

    }).

    service('MarkdownSvc', function() {
        var converter = new Showdown.converter();

        return {
            convert: function(markdown) {
                return converter.makeHtml(markdown);
            },
            convertAndHighlight: function(markdown) {
                var frag = document.createElement('div');
                frag.innerHTML = converter.makeHtml(markdown);
                var codeBlocks = frag.getElementsByTagName('code');
                for (var i = 0, len = codeBlocks.length; i<len; i++) {
                    hljs.highlightBlock(codeBlocks[i]);
                }
                return frag.innerHTML;
            },
            highlightAuto: function (code) {
                return hljs.highlightAuto(code).value;
            },
            highlight: function (name, code, ignore_illegals) {
                return hljs.highlight(name, code, ignore_illegals).value;
            }
        }
    }).

    // A dirty, dirty hack
    filter('tagSet', function($routeParams) {
        return function() {
            return $routeParams.tag != undefined || $routeParams.subcategory != undefined || $routeParams.category != undefined;
        }
    }).

    filter('isSelected', function($routeParams) {
        return function(data) {
            return ($routeParams[data[1]] == data[0]) ? 'selected' : '';
        }
    }).

    filter('portfolioCategoryFilter', function($routeParams) {
        var findIndex = function(key, value) {
            return function(prev, curr, index, list) {
                // To keep from having to pass in a -1 in each reduce() call
                prev = typeof prev != 'number' ? prev[key] == value ? index - 1 : -1 : prev;
                return prev != -1 ? prev : curr[key] == value ? index : -1 ;
            }
        }

        return function(portfolio) {
            if (portfolio == undefined || ($routeParams.category == undefined && $routeParams.subcategory == undefined)) return portfolio;

            var filtered = [];

            filtered = portfolio.reduce(function(previous, current) {
                if  (
                        (!$routeParams.category || current.name == $routeParams.category) &&
                        (!$routeParams.subcategory || !!~current.data.reduce(findIndex('name', $routeParams.subcategory)))
                    ) {
                        previous.push(current);
                    }
                return previous;
            }, []);

            return filtered.length > 0 ? filtered : undefined;

        }
    }).

    filter('portfolioSubcategoryFilter', function($routeParams) {
        return function(subcategory) {
            if (subcategory == undefined || $routeParams.subcategory == undefined) return subcategory;

            var filtered = [];

            filtered = subcategory.reduce(function(previous, current) {
                if (current.name == $routeParams.subcategory) previous.push(current);
                return previous;
            }, []);

            return filtered.length > 0 ? filtered : undefined;

        }
    }).

    filter('blogFilter', function($routeParams) {
        return function(posts) {
            if ($routeParams.tag == undefined || posts == undefined) return posts;
            return posts.reduce(function(previous, current) {
               if (!!~current.tags.indexOf($routeParams.tag)) previous.push(current);
               return previous;
            }, []);
        }
    }).

    filter('toMarkdown', function(MarkdownSvc) {
        return function(data) {
            return MarkdownSvc.convert(data);
        }
    }).

    filter("asDate", function () {
        return function (input) {
            return new Date(input);
        }
    }).

    filter('getTags', function() {
        return function(posts) {

            var tags = [];
            if (!posts) return tags;
            for (var i = 0; i < posts.length; i++) {
                for (var j = 0; j < posts[i].tags.length; j++) {
                    if (!~tags.indexOf(posts[i].tags[j])) tags.push(posts[i].tags[j]);
                }
            }
            return tags;
        }
    }).

    filter("orderByDate", function () {
        return function(items, field, reverse) {
            if (!items) return items;
            items.sort(function (a, b) {
                if (a[field] == 'Present' && b[field] != 'Present') return 1;
                if (b[field] == 'Present') return -1;
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

    directive('safeSrc', function() {
        var data = {},
            ext = ['png', 'jpg', 'svg'];

        return {
            link: function(scope, element, attrs) {

                var el = element[0];
                el.style.visibility = 'hidden';
                el.onload = function() {
                    el.style.visibility = 'visible';
                    if (!data[src]) data[src] = src + '.' + ext[i-1];
                };

                var src = (attrs.ngSrc || attrs.src).split('.')[0],
                    i = 0;

                element.bind('error', function() {
                    if (data[src]) return attrs.$set('ngSrc', data[src]);
                    if (i < ext.length) {
                        setNext();
                    } else {
                        attrs.$set('ngSrc', 'http://i.imgur.com/Q6Vp8Au.jpg')
                    }
                });

                function setNext() {
                    attrs.$set('ngSrc', src + '.' + ext[i]);
                    i++;
                }
            }
        }
    });