var Comment = require("../models/comment.js");
var Campground = require("../models/campground.js");

// ===============================================middleware ==========================================//

var middlewareObj={}
// function for login authentication 
middlewareObj.IsLoggedIn= function( req, res , next)
{
	if (req.isAuthenticated())
		{
			return next();
		}
	req.flash("error" , "Please login first !"); 
	res.redirect('/login') ;
}

// function to check if the blog is own by current user 
middlewareObj.CheckOwnership = function( req , res , next ) {
	if (req.isAuthenticated()) // is user logged in :
		{
			Campground.findById(req.params.id , function(err , foundCampground )
			 { if(err){ res.redirect('back') ;  }
				else { // if yes then check if current logged user is same as that of the 
						// author.id is actually string while user._id actually object 
						// so we cannot compare them directly by using ===
						// so we will use .equals method 
						console.log(foundCampground.author.id); //debug 
						console.log(req.user._id) ;  // debug 
						if(foundCampground.author.id.equals(req.user._id))
							{ next(); }
						else
							{ res.redirect('back') ;  }
					 }
			});
		}
	else 
		{ res.redirect('back'); }
}


// function to check if the comment is owned by logged in user ==//
middlewareObj.checkCommentOwner = function(req , res , next )
{
	if (req.isAuthenticated()) // is user logged in :
		{
			Comment.findById(req.params.comment_id , function(err , foundComment )
			 { if(err){ res.redirect('back') ;  }
				else { 
						console.log(foundComment.author.id); //debug 
						console.log(req.user._id) ;  // debug 
						if(foundComment.author.id.equals(req.user._id)) // if logged user is equal to comment owner user 
							{ next(); }
						else
							{ res.redirect('back') ;  }
					 }
			});
		}
	else 
		{ res.redirect('back'); }
}

// exporting modules
module.exports=middlewareObj

//=====================================================================================================//