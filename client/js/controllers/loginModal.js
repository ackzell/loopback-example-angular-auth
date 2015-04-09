angular
  .module('app')
  .controller('LoginModalCtrl', function ($scope, User) {

  this.cancel = $scope.$dismiss;

  this.submit = function (email, password) {
    User.login({email: email, password: password}, function(user) {
    	$scope.$close(user);
    }, function() {

    });
  };

});