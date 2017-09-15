var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create customer scheme

var requestSchema = new Schema({
	request_id:{type:String,required:true,unique:true},
	customer_name: {type: String},
  customer_id: {type: String, required: true},
	request_type: {type: String, required: true},
  request_date: {type: String},
	request_created_date: {type: String},
	request_modified_date: {type: String},
	request_status: {type: String},
	request_admin_actor: {type: String}
});

//create model for requestSchema
var RequestSchema = mongoose.model('requests', requestSchema, 'requests');


// make this available in our Node applications
module.exports = RequestSchema;
