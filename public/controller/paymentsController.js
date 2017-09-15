/**
 * Customer Controller
 *
 */

app.controller('PaymentsController',PaymentsController);
function PaymentsController($scope,$rootScope,customerFactory,$http) {
      console.log("**** Called Payments **** ");
      $http.get(getPayments).then(function(data){
          console.log(data.data.response);
          $scope.payments =data.data.response.paymentsList;
    })


    }
