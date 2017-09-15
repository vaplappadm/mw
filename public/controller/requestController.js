/**
 * Request Controller
 *
 */

app.controller('RequestController',RequestController);
function RequestController($scope,$rootScope,customerFactory,$http) {


      $http.get(getRequests).then(function(data){
          console.log(data.data.response.requestList);
          $scope.customers =data.data.response.requestList;
    })


    }
