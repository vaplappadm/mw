var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create customer scheme

var feedbackschema = new Schema({
	feedback_id:{type:String,required:true,unique:true},
	customer_name: {type: String, required: true},
  customer_id: {type: String, required: true},
	question_one: {type: String},
  question_one_rating: {type: String, required: true},
  question_two: {type: String},
  question_two_rating: {type: String, required: true},
  question_three: {type: String},
  question_three_rating: {type: String, required: true},
  feedback_date: {type: String},
  feedback_comments: {type: String}
});

//create model for MyFeedbacks
var MyFeedbacks = mongoose.model('feedbacks', feedbackschema, 'feedbacks');


// make this available in our Node applications
module.exports = MyFeedbacks;
