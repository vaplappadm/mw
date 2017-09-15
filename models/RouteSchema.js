var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create Route scheme

var routeschema = new Schema({
	route_id:{type:String,required:true,unique:true},
	route_name: {type: String, required: true},
  pincodes: {type: String, required: true},
	modified_date: {type: String}
});

//create model for demandschema
var MyRoutes = mongoose.model('routes', demandschema, 'routes');


// make this available in our Node applications
module.exports = MyRoutes;
