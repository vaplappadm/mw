/**
 * Login Controller
 */


app.controller('LoginController',LoginController);
function LoginController($scope,$rootScope,$state,loginFactory) {
      $scope.username="administrator";
      $scope.userpassword="vaplgsiri";

      localStorage.setItem("userName", $scope.username);
      console.log(localStorage.getItem("userName"));

      $scope.getCategory=function(user){
        loginFactory.login(user,function(data){
          console.log("Data",data);
        })
        $state.go('dashboard.customers');

    }
}
