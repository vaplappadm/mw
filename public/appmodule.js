/**
 * The application file bootstraps the angular app by initializing the main module.
 */


var app = angular.module("myApp", ["ui.router","ngMaterial"]);

app.config(function($stateProvider, $urlRouterProvider){

$urlRouterProvider.otherwise('/');

$stateProvider
.state("login",{
  url:'/',
  templateUrl : "./templates/loginPage.html",
  controller : "LoginController"

})
.state("dashboard",{
  url:'/dashboard',
  templateUrl : "./templates/homePage.html",
  controller:"HomeController"

})
.state('dashboard.customers',{
  url:'/customers',
  templateUrl : "./templates/customerPage.html",
  controller : "CustomerController"

})
.state('dashboard.payments',{
  url:'/payments',
  templateUrl : "./templates/paymentPage.html",
  controller : "PaymentsController"
})
.state('dashboard.demands',{
  url:'/demands',
  templateUrl : "./templates/demandPage.html",
  controller:"DemandController"
})
.state('dashboard.requests',{
  url:'/requests',
  templateUrl : "./templates/requestPage.html",
  controller:"RequestController"
})
.state('dashboard.messages',{
  url:'/messages',
  templateUrl : "./templates/messagePage.html",
  controller:"MessageController"
});
});
