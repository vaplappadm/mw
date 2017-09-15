var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create customer scheme

var demandschema = new Schema({
	demand_id:{type:String,required:true,unique:true},
	demand_date: {type: String, required: true},
  customer_id: {type: String, required: true},
	customer_name: {type: String},
  demand_quantity: {type: String, required: true},
	demand_month: {type: String},
  demand_status: {type: String,required: true},
	demand_modified_date : {type: String},
	demand_route_id : {type: String},
	demand_route_name : {type: String},
	customer_kaname: {type: String}
});

//create model for demandschema
var MyDemands = mongoose.model('demands', demandschema, 'demands');


// make this available in our Node applications
module.exports = MyDemands;
