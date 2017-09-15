/**
 * Home Controller
 */


app.controller('HomeController',HomeController);
function HomeController($scope, $state) {
   
      $scope.name=localStorage.getItem("userName"); 

      $scope.logout=function(){

        $state.go('login');

    }
     
}