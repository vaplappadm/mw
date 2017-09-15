 /**
  * Defines the service that performs auhentication on login
  */
app.factory('loginFactory',['$http', '$rootScope','$state', function ($http, $rootScope,$state) {
    
  'use strict';
   
   var loginService ={};

   //login function

   loginService.login = function(user,success,error) {

       console.log("User",user);

      /**
       * $http.get(url).success(function(data){
         return data;
       })
       */ 
   }
         return loginService;
}]);

