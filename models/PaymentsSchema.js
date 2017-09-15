var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create customer scheme

var paymentschema = new Schema({
	payment_id:{type:String,required:true,unique:true},
	payment_date: {type: String, required: true},
  customer_id: {type: String, required: true},
	customer_name: {type: String},
  payment_amount: {type: String, required: true},
  payment_status: {type: String,required: true},
	payment_modified_date : {type: String},
	payment_ref_id : {type: String},
	payment_txn_id : {type: String},
	payment_txn_status : {type: String},
	payment_source: {type: String},
	payment_type: {type: String},
	payment_offline_approver: {type: String}
});

//create model for paymentschema
var MyPayments = mongoose.model('payments', paymentschema, 'payments');


// make this available in our Node applications
module.exports = MyPayments;
