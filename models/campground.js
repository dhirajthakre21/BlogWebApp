var mongoose = require("mongoose");
var campgroundSchema= mongoose.Schema({
	name : String , // Capital S is needed in String 
	image : String  , 
	description : String ,
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId, //  object reference // learn this line ; 
         ref: "Comment"
      }
   ]  ,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId, // here the name of auther will be taken from logged in username 
         	ref: "User"
			} ,
	 username: String
	}
});

//make model 'campground ' in which you are going to store the data 
//this is an object which will be exposed as module 
// we will give reference of this to app.js file 
module.exports=mongoose.model('Campground' , campgroundSchema);