/**
 * Demand Controller
 *
 */

app.controller('DemandController',DemandController);
function DemandController($scope,$http) {

      $scope.myDate = new Date();
      $scope.isOpen = false;

      console.log("*** Date "+ $scope.myDate);

      $scope.items = ["AGS Layout", "Bellandur", "Chandra Layout", "Nagavara", "Rajaji Nagara", "Sadashiva Nagara", "Yesvantpura"];
      $scope.selectedItem;
      $scope.getSelectedText = function() {
        if ($scope.selectedItem !== undefined) {
          return $scope.selectedItem;
        } else {
          return "Select Route";
        }
      };

      $http.get(getDemands).then(function(data){
          console.log(data.data.response);
          $scope.customers =data.data.response.data;
    })


    }
