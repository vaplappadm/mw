/**
 * Customer Controller
 *
 */

app.controller('MessageController',MessageController);
function MessageController($scope,$rootScope,customerFactory,$http) {


      $http.get(getCustomers).then(function(data){
          console.log(data.data.response);
          $scope.customers =data.data.response.customersList;
    });

}
