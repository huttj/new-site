(function() {
  try {
    angular.module('angulartics.google.analytics');
  } catch (e) {
    console.log('`angulartics.google.analytics` not available');
    angular.module('angulartics.google.analytics', []);

    var script = document.createElement('script');
    script.src = 'js/g.js';
    document.head.insertBefore(script, document.getElementsByTagName('script')[0]);
  }
})();