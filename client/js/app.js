angular
  .module('app', [
    'lbServices',
    'ui.router',
    'ui.bootstrap'
  ])
  .config(['$stateProvider', '$urlRouterProvider', 
    function($stateProvider,$urlRouterProvider) {
    
    $stateProvider
      .state('landing', {
        url: '',
        template: '<h1> Welcome, this is as far as you can get </h1> <a ui-sref="todo">Show Todos</a>',
        data: {
          requireLogin: false
        }
      })
      .state('todo', {
        url: '',
        templateUrl: 'views/todo.html',
        controller: 'TodoController',
        data: {
          requireLogin: true
        }
      });

    $urlRouterProvider.otherwise('landing');
  }])
  .config(function ($httpProvider) {

    $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
      var loginModal, $http, $state;

      // this trick must be done so that we don't receive
      // `Uncaught Error: [$injector:cdep] Circular dependency found`
      $timeout(function () {
        loginModal = $injector.get('loginModal');
        $http = $injector.get('$http');
        $state = $injector.get('$state');
      });

      return {
        responseError: function (rejection) {
          if (rejection.status !== 401) {
            return rejection;
          }

          var deferred = $q.defer();

          loginModal()
            .then(function () {
              deferred.resolve( $http(rejection.config) );
            })
            .catch(function () {
              $state.go('landing');
              deferred.reject(rejection);
            });

          return deferred.promise;
        }
      };
    });

  })
  .run(function ($rootScope, loginModal, $state) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      var requireLogin = toState.data.requireLogin;

      if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
        event.preventDefault();
        
        loginModal()
          .then(function (user) {
            $rootScope.currentUser = user;
            return $state.go(toState.name, toParams);
          })
          .catch(function () {
            return $state.go('landing');
          });

        console.log('attempted to access a requireLogin page');
      }
    });

  });
