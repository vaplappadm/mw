'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('vapl_middleware');

var express = require('express');
var app = express();
var FCM = require('fcm-node');
var cors = require('cors');
var querystring = require('querystring');
var http = require('http');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var request = require("request");
var mongoose = require('mongoose');
const translate = require('google-translate-api');

var server = http.createServer(app);
app.use(express.static('public'));

var MyCustomer = require('./models/CustomerSchema.js');
var MyDemand = require('./models/DemandSchema.js');
var MyRequest = require('./models/RequestSchema.js');
var MyPayment = require('./models/PaymentsSchema.js');

var CONFIG = require('./config.js');

var textLocalApiKey = CONFIG.TEXTLOCAL_API_KEY;

var fcm = new FCM(CONFIG.FCM_API_KEY);

var kannadaname;

//var url = 'mongodb://admin:_Dk74LbBffbF@127.9.2.130:27017/vapl_agri_db';
	//var url = 'mongodb://127.0.0.1:27017/vapl_agri_db';
	var url = 'mongodb://admin:MongoPass!23@ds129374.mlab.com:29374/vapl_agri_db'

app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');
/*app.use(expressJWT({
	secret: 'secret'
}).unless({
	path: ['/addCustomer']
}));*/

// Mongoose connection to MongoDB
mongoose.connect(url, {useMongoClient:true} , function (error) {
    logger.debug("Connecting to Database - "+ url);
    if (error) {
        console.log(error);
    }
    else {
      {
        logger.debug("Connection to MongoDB Successful"+url);
      }
    }
});

app.get('/generateDemand', function(req, res)
{
	res.sendfile(__dirname+'/manager.html');
});

app.get('/getDemands', function(req, res)
{
	var today = getTodaysDate();
	MyDemand.find({}, function(err, demands)
  {
		  var dArray = [];
			if (err) throw err;
			demands.forEach(function(record)
			{
					if(record.demand_date.includes(getTodaysDate()))
					{
							dArray.push(record);
					}
			});
			var demands = {data : dArray};
			sendCorsResponse(res, demands);
	})
})

app.get('/getAllDemands', function(req, res)
{

	MyDemand.find({}, function(err, demands)
  {
		  var dArray = [];
			if (err) throw err;
			demands.forEach(function(record)
			{
						dArray.push(record);
			});
			var demands = {data : dArray};
			sendCorsResponse(res, demands);
	});
});

app.get('/getDemandsForCustomer', function(req, res)
{
	var customerId = req.query.customerId;
	log("Customer ID "+ customerId);
	MyDemand.find({customer_id:customerId}, function(err, demands)
  {
		  var dArray = [];
			if (err) throw err;
			var response = {demandList : demands};
			response.status = "success";
			sendCorsResponse(res, response);
	});
});

app.get('/getDemands', function(req, res)
{
	var requestDate = req.query.requestDate;
	var requestRoute = req.query.requestDate;
	var dateFlag = false;
	var routeFlag = false;
	if(!isUndefinedOrNUll(requestDate))
	{
		 dateFlag = true;
	}
	if(!isUndefinedOrNUll(requestRoute))
	{
		 routeFlag = true;
	}

	if(!requestRoute)
	{
		 sendCorsResponse(res, getMissingFieldErrorMessage('requestRoute'));
		 return;
	}
	MyDemand.find({}, function(err, demands)
  {
		  var dArray = [];
			if (err) throw err;
			demands.forEach(function(record)
			{
					if(record.demand_date.includes(requestDate) || record.demand_route_id === requestRoute)
					{
							if(requestRoute === record.route_id)
							record.demand_route_name = getRouteNameForId(record.demand_route_id);
							dArray.push(record);
					}
			});
			var demands = {demandList : dArray};
			sendCorsResponse(res, demands);
	});
});

function getNameForCustomer(customerId)
{
	MyCustomer.findOne({customer_id:customerId}, function(err, customer)
	{
		log("*** getting Name for "+ customerId+" "+ customer.customer_name);
		return customer.customer_name;
	});
}

function getRouteForCustomer(customerId)
{
	MyCustomer.findOne({customer_id:customerId}).exec(function(err, customer)
	{
		return customer.route_id;
	});
}

function getRouteNameForId(routeId)
{
	MyRoutes.findOne({route_id:routeId}).exec(function(err, route)
	{
		return route.route_name;
	});
}

app.post('/createDemand', function(req, res)
{
	var bodyParams = req.body;
	var demandDates = bodyParams.demandDates;
	var customerId = bodyParams.customerId;
	var customerPhone = bodyParams.customerPhone;
	var quantity = bodyParams.quantity;
	var maxId;

  log("Date "+ getDateTime());
	var customerId, customerName;
	MyCustomer.findOne({customer_id:customerId}).exec(function(err, customer)
	{

		customerName = customer.customer_name;

		MyDemand.find({}).sort({demand_id:-1}).limit(1).exec(function(err, cat) {
		 if (err) throw err;

		 if(cat.length == 0 || cat == 'undefined' || cat == '')
		 {
				maxId = 1;
		 }
		 else
		 {
			 maxId = parseInt(cat[0].demand_id) + 1;
		 }

	 			var kaname = customer.customer_kaname;
				var newDemand = MyDemand({
					demand_id: maxId,
					demand_date: demandDates,
					demand_modified_date: getDateTime(),
					customer_id: customerId,
					demand_quantity: quantity,
					demand_status: "Active",
					customer_name: customerName,
					customer_kaname: kaname,
					demand_route_id: getRouteForCustomer(customerId)
				});

				logger.debug("Adding new Demand to database"+maxId);

				newDemand.save(function(err) {
					if (err)
					{
						logger.debug("Error saving new demand to database "+maxId+" "+err);
						sendCorsResponse(res, getErrorMessage("Error saving new demand to database"));
					}
					else
					{
						logger.debug("Success saving new Demand to database "+maxId);
						var response = getSuccessMessage("Demand created Successfully");
						logger.debug("New Demand Addition Response \n "+ response);
						sendCorsResponse(res, response);
					}
				});
	})

	});
});

function isUndefinedOrNUll(cat)
{
	return cat.length == 0 || cat == 'undefined' || cat == '';
}

app.post('/createRequest', function(req, res)
{
	var bodyParams = req.body;
	var customerId = bodyParams.customerId;
	var requestType = bodyParams.requestType;
	var requestDate = bodyParams.requestDate;
	var customerName;

	var maxId;

	MyCustomer.findOne({customer_id:customerId}).exec(function(err, cat)
	{
		customerName = cat.customer_name;
		log("**** CUSTOMER NAME **** "+ customerName);

	MyRequest.find({}).sort({request_id:-1}).limit(1).exec(function(err, cat)
	{
		 if (err) throw err;

		 if(cat.length == 0 || cat == 'undefined' || cat == '')
		 {
				maxId = 1;
		 }
		 else
		 {
			 maxId = parseInt(cat[0].request_id) + 1;
		 }
		 var newRequest = MyRequest({
			 request_id: maxId,
			 customer_id: customerId,
			 customer_name: customerName,
			 request_modified_date: getDateTime(),
			 request_created_date: getDateTime(),
			 request_type: requestType,
			 request_date: requestDate,
			 request_status: 'Pending'
		 });
		 newRequest.save(function(err) {
			 if (err)
			 {
				 logger.debug("Error saving new request to database "+maxId+" "+err);
				 sendCorsResponse(res, getErrorMessage("Error saving new request to database"));
			 }
			 else
			 {
				 logger.debug("Success saving new Request to database "+maxId);
				 var response = getSuccessMessage("Request created Successfully");
				 logger.debug("New Request Addition Response \n "+ response);
				 sendCorsResponse(res, response);
				 // SEND SMS
			 }
		 });
 });

 });
});

app.post('/approveRequest', function(req, res)
{
	var bodyParams = req.body;
	var requestId = bodyParams.requestId;
	var requestStatus = bodyParams.requestStatus;
	var admin_actor = bodyParams.adminActor;
	var modified_date = getDateTime();
	MyRequest.findOneAndUpdate
	(
		{request_id:requestId},{$set:
			{request_status:requestStatus,
			 request_modified_date:modified_date,
			 request_admin_actor:admin_actor,
			}},
	function(err, data)
	{
			if (err)
			{
				sendCorsResponse(res, getSuccessMessage("Request update Failed"));
				throw err;
				return;
			}
			sendCorsResponse(res, getSuccessMessage("Request updated Successfully"));
	});
});

app.get('/getRequests', function(req, res)
{
	var customerId = req.query.customerId;

	MyRequest.find({customer_id:customerId}, function(err, data)
	{
		   if(err) throw err;
			 if(data && data.length > 0)
			 {
				 var response = getSuccessMessage("");
				 response.requestList = data;
				 sendCorsResponse(res, response);
			 }
			 else
			 {
				 var response = getSuccessMessage("");
 				 response.requestList = [];
 				 sendCorsResponse(res, response);
			 }
	});
});

app.get('/getAllRequests', function(req, res)
{

	MyRequest.find({}, function(err, requests)
	{
		   if(err) throw err;
			 if(requests && requests.length > 0)
			 {
				 var _requestsList = [];

				 requests.forEach(function(request)
	 			 {
						_requestsList.push(request);
	 			 });

				 var response = getSuccessMessage("");
				 response.requestList = _requestsList;
				 sendCorsResponse(res, response);
			 }
	});
});


app.get('/getAllPayments', function(req, res)
{

	MyPayment.find({}, function(err, requests)
	{
		   if(err) throw err;
			 if(requests && requests.length > 0)
			 {
				 var response = {};
				 response.paymentsList = requests;
				 sendCorsResponse(res, response);
			 }
			 else {
			 	 sendCorsResponse(res, getErrorMessage("No data found"));
			 }
	});
});

app.get('/getPayments', function(req, res)
{
	var customerId = req.query.customerId;
	MyPayment.find({customer_id:customerId}, function(err, requests)
	{
		   if(err) throw err;
			 if(requests && requests.length > 0)
			 {
				 var response = {};
				 response.paymentsList = requests;
				 sendCorsResponse(res, response);
			 }
			 else {
			 	 sendCorsResponse(res, getErrorMessage("No data found"));
			 }
	});
});

app.post('/addPayment',function(req,res){
   var bodyParams = req.body;
   var customerId = bodyParams.customerId;
   var txnId = bodyParams.txnId;
   var txnDate = bodyParams.txnDate;
	 var txnAmount = bodyParams.txnAmount;


	 var maxId;
	 MyCustomer.findOne({customer_id:customerId}).exec(function(err, customer)
	 {
		 var cName = customer.customer_name;

   MyPayment.find({}).sort({payment_id:-1}).limit(1).exec(function(err, cat)
	 {
	      if (err) throw err;

		    if(cat.length == 0 || cat == 'undefined' || cat == '')
		    {
		       maxId = 1;
		    }
		    else
		    {
		      maxId = parseInt(cat[0].payment_id) + 1;
		    }




					log("Customer Name ***** "+ cName);

					var newPayment = MyPayment({
					 payment_id: maxId,
					 customer_id: customerId,
					 customer_name: cName,
					 payment_date: txnDate,
					 payment_amount: txnAmount,
					 payment_status: 'Pending',
					 payment_txn_id: txnId,
					 payment_type: 'Offline',
				 });

				 newPayment.save(function(err) {
					 if (err)
					 {
						 logger.debug("Error saving new Payment to database "+customerId+" "+err.code);
						 sendCorsResponse(res, getErrorMessage("Error saving new payment. Please try again"));
					 }
					 else
					 {
						 logger.debug("Success saving new payment to database "+customerId);
						 var response = getSuccessMessage("Payment request sent.");
						 sendCorsResponse(res, response);
					 }
				 });
				});
	  });
});

app.post('/approvePayment', function(req, res)
{
	var bodyParams = req.body;
	var paymentId = bodyParams.paymentId;
	var paymentStatus = bodyParams.paymentStatus;
	var admin_actor = bodyParams.adminActor;
	var modified_date = getDateTime();
	MyPayment.findOneAndUpdate
	(
		  {payment_id:paymentId},{$set:
			{payment_status:paymentStatus,
			 payment_modified_date:modified_date,
			 request_admin_actor:admin_actor,
			}},
	function(err, data)
	{
			if (err)
			{
				sendCorsResponse(res, getSuccessMessage("Payment update Failed"));
				throw err;
				return;
			}
			sendCorsResponse(res, getSuccessMessage("Payment updated Successfully"));
	});
});

app.post('/addCustomer',function(req,res){

	 console.log("***** Add Customer End Point Called ***** ");
   var bodyParams = req.body;
   var customerName = bodyParams.customerName;
   var customerEmail = bodyParams.customerEmail;
   var customerPhone = bodyParams.customerPhone;
	 var customerPassword = bodyParams.customerPassword;
	 var customerAddress = bodyParams.customerAddress;
   var userAgent = req.get('User-Agent');
   var device = bodyParams.Device;
   var deviceOs = bodyParams.DeviceOs;
	 var nonce = bodyParams.nonce;
	 var customerPincode = bodyParams.customerPincode;
	 var customerLandmark = bodyParams.customerLandmark;

   if(!customerName)
   {
      sendCorsResponse(res, getMissingFieldErrorMessage('customerName'));
      return;
   }

   if(!customerEmail)
   {
      sendCorsResponse(res, getMissingFieldErrorMessage('customerEmail'));
      return;
   }

   if(!customerPhone)
   {
      sendCorsResponse(res, getMissingFieldErrorMessage('customerPhone'));
      return;
   }

   if(!device)
   {
      sendCorsResponse(res, getMissingFieldErrorMessage('Device'));
      return;
   }

   if(!deviceOs)
   {
      sendCorsResponse(res, getMissingFieldErrorMessage('DeviceOs'));
      return;
   }

	 var maxId;
   MyCustomer.find({}).sort({customer_id:-1}).limit(1).exec(function(err, cat) {
    if (err) throw err;

    if(cat.length == 0 || cat == 'undefined' || cat == '')
    {
       maxId = 1;
    }
    else
    {
      maxId = parseInt(cat[0].customer_id) + 1;
    }

		var jwtToken = getToken(customerName, customerPhone);
		var otp = getOtp();
    // add new customer
      var newCustomer = MyCustomer({
    		customer_id: maxId,
        customer_name: customerName,
    		customer_email: customerEmail,
    		customer_phone: customerPhone,
        customer_device: device,
        customer_device_os: deviceOs,
				customer_password: customerPassword,
				customer_jwt_token: jwtToken,
				customer_otp: otp,
				customer_otp_status: "Not Verified",
				customer_address: customerAddress,
				customer_landmark: customerLandmark,
				customer_modified_date: nonce,
				customer_vapl_id: nonce+""+maxId,
				customer_walletBalance: '0.00',
				customer_consumption: '0',
				customer_islive: true
  		});

      logger.debug("Adding new customer to database"+customerName);

      newCustomer.save(function(err) {
        if (err)
        {
          logger.debug("Error saving new customer to database "+customerName+" "+err.code);
					// Duplicate error code
					if(err.code == 11000)
					{
							sendCorsResponse(res, getErrorMessage("User already exists. Please login."));
							return;
					}
          sendCorsResponse(res, getErrorMessage("Error saving new customer to database"));
        }
        else
        {
          logger.debug("Success saving new customer to database "+customerName);
          var response = getSuccessMessage("Customer added to the database");
          response.token = getToken(customerName, customerPhone);
					response.id = maxId;
          logger.debug("New Customer Addition Response \n "+ response);
          sendCorsResponse(res, response);
					//sendOtp(customerPhone, otp);
					getKannadaName(customerName, maxId);
        }
      });

   });

});

app.post('/validateOtp', function(req, res)
{
	var customerId = req.body.customerId;
	var customerOtp = req.body.customerOtp;
	MyCustomer.find({customer_id:customerId}, function(err, data)
	{
		   if(err) throw err;
			 if(data && data.length > 0)
			 {
				 if(customerOtp.indexOf(data[0].customer_otp) !== -1)
				 {
					 MyCustomer.findOneAndUpdate({customer_id:customerId},
					 {$set:{customer_otp_status:'Verified'}},function(err, data)
					 {
							 if (err) throw err;
							 sendCorsResponse(res, getSuccessMessage("OTP validated Successfully"));
							 return;
					 });
					 return;
				 }
				 sendCorsResponse(res, getErrorMessage('OTP Validation Failed. User not found'));
			 }
	});
});

app.get('/getCustomer', function(req, res)
{
	 var customerId = req.query.customerId;

	 MyCustomer.findOne({customer_id:customerId}).exec(function(err, data)
	 {
		 if(err) throw err;
				if(data)
				{
					if(!data.customer_islive)
					{
							sendCorsResponse(res, getSuccessMessage('Account Disabled. Please contact us.'));
							return;
					}
					sendCorsResponse(res, data);
				}
				else
				{
					sendCorsResponse(res, getErrorMessage('Authentication Failed'));
				}
	 });
});

app.get('/getCustomers', function(req, res)
{
	 MyCustomer.find({}).exec(function(err, data)
	 {
		 if(err) throw err;
				if(data)
				{
					var response = {};
					response.customersList = data;
					sendCorsResponse(res, response);
				}
				else
				{
					sendCorsResponse(res, getSuccessMessage("No data found"));
				}
	 });
});

app.post('/validateLogin', function(req, res)
{
	var bodyParams = req.body;
	var username = bodyParams.username;
	var password = bodyParams.password;
	var token = bodyParams.token;

	if(!username)
	{
		 sendCorsResponse(res, getMissingFieldErrorMessage('username'));
		 return;
	}

	if(!password)
	{
		 sendCorsResponse(res, getMissingFieldErrorMessage('password'));
		 return;
	}

	 MyCustomer.findOne({customer_phone:username, customer_password:password}).exec(function(err, data)
	 {
		 if(err) throw err;
				if(data)
				{
					var response = getSuccessMessage('Authentication Successful');
					response.token = data.customer_jwt_token;
					response.name = data.customer_name;
					response.email = data.customer_email;
					response.id = data.customer_id;
					log("Login Validated")
					sendCorsResponse(res, response);
				}
				else
				{
					sendCorsResponse(res, getErrorMessage('Authentication Failed'));
				}
	 });
});

app.post('/updateFcmToken', function(req, res)
{
	var fcmToken = req.body.fcmToken;
	var customerId = req.body.customerId;
	var accessToken = req.body.token;

	log("UPDATE FCM "+accessToken);

	if(!accessToken)
	{
		 sendCorsResponse(res, getMissingFieldErrorMessage('token'));
		 return;
	}


	if(verifyToken(accessToken, res))
	{
		log("JWT Good in update FCM");
		MyCustomer.findOneAndUpdate({customer_id:customerId},{$set:{customer_fcmToken:fcmToken}},function(err, data)
		{
        if (err) throw err;
        sendCorsResponse(res, getSuccessMessage("Fcm token updated"));
    });
	}
});

app.post('/pushMessage', function(req, res)
{
	var _message = req.query.message;
	var resJson = {title:"Vasudhaavana", message:_message};
	var tokens = [];
	MyCustomer.find({}, function(err, customers)
  {
			if (err) throw err;
			customers.forEach(function(record)
			{
				  var token = record.customer_fcmToken;
					log("Token "+ token);
					tokens.push(token);
			});

			log("Sending Push Message "+ JSON.stringify(resJson));
			log("Sending Push Tokens "+ tokens);

		  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
		      registration_ids: tokens,
		      data: {  //you can send only notification or only data(or include both)
		          'message': JSON.stringify(resJson),
		      }
		  };
		  fcm.send(message, function(err, response)
			{
		      if (err) {
		          log("Something has gone wrong!"+ err);
		          sendCorsResponse(res, getErrorMessage("Failed to send FCM Message. Reason:"+err));
		      } else {
		          log("Successfully sent with response: ", response);
		          sendCorsResponse(res, getSuccessMessage("FCM Messages sent Successfully"));
		      }
		  });
	});
});

function log(message)
{
	logger.debug(message);
}

function getTodaysDate()
{
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "-" + month + "-" + year;
}


function getDateTime()
{
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "-" + month + "-" + year + "-" + hour + ":" + min + ":" + sec;
}

function getOtp()
{
	var randomOtp = Math.floor(100000 + Math.random() * 900000)
  randomOtp = randomOtp.toString().substring(0, 4);
	return randomOtp;
}

function getToken(_username, _phone)
{
  var token = jwt.sign({
		username: _username,
		phone: _phone
	}, app.get('secret'));
  return token;
}

function verifyToken(token, res)
{
	return true;
  /*jwt.verify(token, app.get('secret'), function(err, decoded) {
		if (err)
    {
			  var response = {status:false,message:"Failed to authenticate token"};
        sendCorsResponse(res, JSON.stringify(response));
        return;
		}
    else
    {
			logger.debug("JWT Good.")
      return true;
		}
	});*/
}

function thunderAdminSms(message)
{
	request.post(
    'http://198.15.98.50/API/pushsms.aspx?loginID=demo01&password=sms123456&mobile=9242169129,9845557009,9886154853&text=Sanjey%20from%20ChandraLayout%20has%20requested%20not%20to%20deliver%20milk%20tommorrow&senderid=VM-VAPL&route_id=1&Unicode=0',
    { json: { key: 'value' } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    });
}

function sendOtp(phone, otp)
{
	var data = querystring.stringify({
      apikey: textLocalApiKey,
      message: otp+" - is your otp for signing up on VAPL Mobile App. Thanks for signing up and Have a nice day. Vasudhaavana Agri Pvt Ltd.",
			sender: "TXTLCL",
			numbers: phone
    });

	var options = {
	    host: 'api.textlocal.in',

	    path: '/send?',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var req = http.request(options, function(res)
	{
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log("body: " + chunk);
    });
	});

req.write(data);
req.end();
}

//sendOtp("9611363267", "1008");

function getMissingFieldErrorMessage(field) {
	var response = {
		status: false,
		message: field + ' field is missing or Invalid in the request'
	};

  logger.debug("MFER "+ JSON.stringify(response));
	return response;
}

function getErrorMessage(_message) {
	var response = {
		status: false,
		message: _message
	};

  logger.debug("MFER "+ JSON.stringify(response));
	return response;
}

function getSuccessMessage(_message)
{
  var response = {
		status: true,
		message: _message
	};

  logger.debug("MFER "+ JSON.stringify(response));
	return response;
}

function sendCorsResponse(res, data)
{
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Access-Token, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  var data = {response : data};
  data = JSON.stringify(data);
  res.end(""+data);
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');

app.listen(app.get('port'), app.get('ip'), function(){
  logger.debug('VAPL MIDDLEWARE Express server v0.0.1 listening at ' +app.get('ip')+':'+ app.get('port'));
});

//sendOtp('9611363267', '9009');


function getKannadaName(engName, id)
{
	translate(engName, {to: 'kn', raw: true, }).then(res => {
			console.log(id+" - "+res.text);

			MyCustomer.findOneAndUpdate({customer_id:id},{$set:{customer_kaname:res.text}},function(err, data)
			{
	        if (err) throw err;
	        log("Updated Kaname for ID "+id+" : Name "+ engName);
	    });
	}).catch(err => {
			console.error(err);
	});
}
/*setKanDemand();
function setKanDemand()
{
	translate('Ganapati', {to: 'kn', raw: true, }).then(res => {


			MyDemand.findOneAndUpdate({customer_id:1},{$set:{customer_kaname:res.text}},function(err, data)
			{
	        if (err) throw err;
	        console.log("Updated Demand "+ res.text);
	    });
	}).catch(err => {
			console.error(err);
	});
}*/

function getKannadaNameFromMongo(id)
{
	log("Getting Ka name from Mongo for "+id);
	MyCustomer.findOne({customer_id:id},function(err, data)
	{
			if (err) throw err;
			return data.customer_kaname;
	});
}
