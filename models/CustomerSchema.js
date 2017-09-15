var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create customer scheme

var customerschema = new Schema({
	customer_id:{type:String,required:true,unique:true},
	customer_vapl_id:{type:String,required:true,unique:true},
	customer_name: {type: String, required: true},
  customer_email: {type: String, required: true, unique:true},
  customer_phone: {type: String, required: true, unique:true},
	customer_fcmToken : {type: String},
  customer_walletBalance: {type: String},
  customer_primaryAccount: {type: String},
  customer_secondaryAccount: {type: String},
  customer_kaname: {type: String},
  customer_user_agent: {type: String},
  customer_device: {type: String},
  customer_device_os : {type: String},
	customer_otp: {type: String},
	customer_otp_status: {type: String},
	customer_password: {type: String},
	customer_jwt_token: {type: String},
	customer_address: {type: String},
	customer_modified_date: {type: String},
	customer_pincode: {type: String},
	customer_landmark: {type: String},
	customer_route_id: {type: String},
	customer_islive: {type: Boolean},
	customer_consumption : {type: String}
});

//create model for customerschema
var MyCustomer = mongoose.model('customers', customerschema, 'customers');


// make this available in our Node applications
module.exports = MyCustomer;
