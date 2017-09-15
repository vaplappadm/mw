/**
 * Customer Controller
 *
 */

app.controller('CustomerController',CustomerController);
function CustomerController($scope,$rootScope,customerFactory,$http) {


      $http.get(getCustomers).then(function(data){
          console.log(data.data.response);
          $scope.customers =data.data.response.customersList;
    })


    }
