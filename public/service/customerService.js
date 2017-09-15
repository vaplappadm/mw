 /**
  * Defines the Customer services
  */
  app.factory('customerFactory',['$http', '$rootScope','$state', function ($http, $rootScope,$state) {
    
  'use strict';
   
   var customerService ={};

   //login function

   customerService.custData = function() {


     
       $http.get("../data/customer.json").then(function(data){
           console.log("Customer Data",data);
         return data;
       })
       
   }
         return customerService;
}]);
