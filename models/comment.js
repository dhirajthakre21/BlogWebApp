var mongoose = require("mongoose");
 
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
		id: {
			type: mongoose.Schema.Types.ObjectId, // here the name of auther will be taken from logged in username 
         	ref: "User"
			} ,
	 username: String
	}
});
 
module.exports = mongoose.model("Comment", commentSchema);