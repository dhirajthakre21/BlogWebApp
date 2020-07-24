//npm init and enter the details 
//npm init and enter the details 
// install packages using npm install **** --save : express , mongoose , body parser (to geta data from form) , and ejs 
//make views and add ejs files in it 
//install body parser used in post method
//install mongoose ..npm install mongoose --save
//use the same syntax of mongoose connectivity server 
// install flash-connect npm install --save connect-flash 
// "start" : "node app.js " for deployinggt 
var express= require("express")
var app=express();
var bodyparser=require("body-parser");
var mongoose = require("mongoose");
// taking schema from campground.js file // we don't need .js  
var Campground=require("./models/campground");
var Comment = require("./models/comment") ; 
var seedDB=require('./seed') ; 
var User = require ("./models/user") // aking schema for login authentication  
var middleware= require ("./middleware/index.js");
// for put request 
var methodOverride = require ("method-override") ; 
var flash = require("connect-flash");
// =====================================packages for authentication======================================== :
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var User = require("./models/user") ;

//Memories this line 
//=========================================== body parser and view engine ===========================================//

app.use(bodyparser.urlencoded({extended : true }));
app.set('view engine', 'ejs')
app.use(methodOverride("_method")); 
// for flash function 
app.use(flash());
//passport configuration 
////==================================== for passport Authentication  =========================================//
 app.use(require('express-session')(
 { secret : 'Dhiraj will win ' ,
   resave : false ,
   saveUninitialized :  false 
}));
//================================================//

app.use(passport.initialize());
app.use(passport.session());

 //This methods are generally used to read session and taking data from it econding it and decoding it 
passport.use( new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=================== here the function will provide loguser to every route of app as well as the flash key 'error'=============================//
// this needs to write after passport 
app.use(function(req , res , next )
		{
	res.locals.error=req.flash("error") ; 
	res.locals.success=req.flash("success");
	res.locals.loguser=req.user ;
	
	next(); 
});
//=========================================mongoose connectivity ============================================//
//const connect = mongoose.connect('mongodb://localhost:27017/test', 
const connect = mongoose.connect('mongodb+srv://dhirajthakre21:dhiraj1thakre1@blogsite.czlel.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true  , useUnifiedTopology: true }); 
//mongodb atlas 
//confirm the connection 
connect.then((db)=>{
	console.log('You are successfully Connected the mongoose server ');
} , (err) =>{
	console.log(err);
	
});
//==================================================database===================================================//
//seedDB(); // we are seeding whole campground 
//=============================================================================================================//

 /*
Campground.create({ // Enter data into it collection 'Campground'
	name : 'Milky Way' ,
	image : 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSCeCFItiPPW-bIMeONPuW4okogHDM_R23-r55H-TLSwHOvOpWD&usqp=CAU' , 
	description : 'It is our own galaxy'
} , function (err , campground) // check for error call back function
{ if (err)
	{
		console.log('Error');
	}
 else {
	 console.log('We have saved the data') // if no error 
 }
	
}); */


//================================routing for Index Page ============================================================//
app.get("/" , function (req , res)
	{
	res.render("landing");
	});
//============================================= for campground =====================================================//
app.get("/campgrounds" , function (req , res)
	{
	Campground.find({ // get the data by .find 
} , function (err , Allcampgrounds) // check for error call back function
		{ 	
		if (err)
		{
		console.log('Error');
		}
 	else 
		{
		res.render('campgrounds' , {campgrounds:Allcampgrounds , loguser : req.user});
 		}
	
	});
});

 app.post("/campgrounds" , middleware.IsLoggedIn, function(req , res) {
	 //get data from form's name
	 // we use req.body.name to get data and store it 
	 var name= req.body.name ;
	 var image=req.body.image ;
	 var description = req.body.description ;
	 var author ={
		 		id : req.user._id , 
		 		username : req.user.username  
				}
	  var newcamp = { name:name , image:image , description : description  , author : author };
	 
	// make an object newcam and store the data into it  
	 
	  //create new collection newcam store it in database and pass 
	Campground.create( newcamp , function (err , campground) // check for error call back function
	{ 
	if (err)
		{
		console.log('Error');
		}
	else 
		
		{
	//redirect to campgrounds page  
		req.flash('success' , 'Blog is added successfully ! ');
	  res.redirect('\campgrounds');
 		}
 		});
 });
//==============================================comments=======================================
 app.get("/campgrounds/new" , middleware.IsLoggedIn , function (req , res){
	//res.send('hey')
 	res.render("new");
 });

app.get("/campgrounds/:id" , function(req , res)
		//value , callback 
		// we are taking value of route by req.params mathod 
{   // we can find our document of collection by using its id ....
	// comment is actully different entity.. if we want to use it inside compground , we will need to populate it with campgroud then exec is used to execute the total query 
	Campground.findById(req.params.id).populate('comments').exec(function(err , foundCampground)
	{
		res.render('show' , {Campground : foundCampground} );	
		// console.log('camp======>>' ,foundCampground )
});
});
// The isloggedIn function will return next only if you are logged in 
// so login authentication is needed for posting the comments 
app.get('/campgrounds/:id/comments/new' , middleware.IsLoggedIn , function(req , res)
	   {
		Campground.findById(req.params.id , function(err , campground)
		{
			res.render('comment/new' , {campground : campground  })
		});
});
//post method for the comment ; 
// for posting also authenticated user is needed 
app.post('/campgrounds/:id/comments' , middleware.IsLoggedIn, function(req , res )
		{ 
	Campground.findById(req.params.id , function(err , campground)
						{
							if (err)
								{
									console.log('error hai bhai comment me ');
								}
							else 
								{ 
									Comment.create(req.body.comment , function (err , comment )
									{
									// add username and id to comment  
									comment.author.id = req.user._id ;
									comment.author.username = req.user.username ;
									comment.save()
			
									 campground.comments.push(comment);
									 campground.save();
									 // console.log('comment===>>' , comment );
									
										
									req.flash('success' , 'Comment is added successfully ! ')
									res.redirect('/campgrounds/'+ campground._id)
										
									});
								}
							});
						}); 


// ============================= authentication route =============================================//

// ===========================================register=============================================// 
app.get('/register' , function( req , res )
	  { 
	res.render('register') ;  
});
app.post('/register' , function(req , res )
		{ 
		 req.body.username ;
		 req.body.password ; 
	
		User.register(new User ({username : req.body.username }) , req.body.password , function( err , user )
			 {
			if(err)
				{
				req.flash('error' , err.message ); // will print error if name is alredy registred or is null 
				console.log(err) ;  //debug 
				res.redirect('/register');	
				}
			else 
				{
					passport.authenticate('local')(req , res , function()
					{	req.flash('success' , 'Welcome to you ') ; 
						res.redirect('/campgrounds')	;
					});
				}			
});
});
//============================================= Login ==============================================//
app.get('/login' , function(req , res)
	   {
	res.render('login') ; 
	
});
app.post('/login' , passport.authenticate("local" , {
	successRedirect : '/campgrounds' , 
	failureRedirect : '/login'	
}) , function(req , res )
	{	
	});

//===========================================Log out ===============================================//
app.get('/logout' , function(req , res )
	   {
	req.logout();
	req.flash('success' , 'Logged you out ! ') // key value pair 
	res.redirect('/campgrounds') ; 
	
});

// ==========================================edit =================================================//
// only author of the blog should be able to edit the blog 

app.get('/campgrounds/:id/edit' , middleware.CheckOwnership  , function(req , res )
		{
	
			Campground.findById(req.params.id , function(err , foundCampground )
			{
			 	res.render("edit", { campground : foundCampground  })	; 
						
			});
	});
//===========================================================================
app.put('/campgrounds/:id' , middleware.CheckOwnership , function(req ,res )
		 {
			Campground.findByIdAndUpdate( req.params.id , req.body.camp , function(err , updatedCamp)  
										{
				if(err)
					{
					console.log(err);
					}
				else 
					{
					req.flash('success' , 'Blog is updated successfully  ! ')
					res.redirect('/campgrounds/'+ req.params.id)	;
					}
				
			}) ; 
});
//==============================================destroy============================================//
app.delete("/campgrounds/:id"  , middleware.CheckOwnership , function(req , res )
		  {
	Campground.findByIdAndRemove(req.params.id , function(err )
								{
		if (err)
			{ console.log(err);
			}
		else  
			{	req.flash('success' , 'Succesfully deleted ! ')
				res.redirect('/campgrounds');
			}
		
	});
	
});

//===================================edit and update the comment ================================//
app.get('/campgrounds/:id/comments/:comment_id/edit' , middleware.checkCommentOwner  , function(req , res )
		{
		Comment.findById( req.params.comment_id , function( err , foundComment)
			{
		
				if (err)
					{
						console.log('error');
					}
				else 
					{
							console.log('foundcomment=>>' , foundComment);
						    console.log(' compground_id' , req.params.id ) ; 
					   		res.render('comment/Edit' , {campground_id : req.params.id , comment : foundComment }) ;	
					} 
				
			});

	});
//=================================== Put method for update ========================================//
app.put('/campgrounds/:id/comments/:comment_id' , middleware.checkCommentOwner , function(req ,res )
		 {

			Comment.findByIdAndUpdate( req.params.comment_id , req.body.comment , function(err , updatedCamp)  
										{
				if(err)
					{
					console.log(err);
					}
				else 
					{
					req.flash('success' , 'Comment is succesfully updated  ! ');
					res.redirect('/campgrounds/'+ req.params.id)	;
					}
				
			}) ;
});

//==============================================delete comment =========================================//
app.delete("/campgrounds/:id/comments/:comment_id"  , middleware.checkCommentOwner , function(req , res )
		  {
	Comment.findByIdAndRemove(req.params.comment_id , function(err )
								{
		if (err)
			{ console.log(err);
			}
		else  
			{	req.flash('success' , 'Comment is deleted succesfully ! ')
				res.redirect('/campgrounds/'+ req.params.id);
			}
	});
});
//=============================================Server is connected =================================//
app.listen(process.env.PORT , process.env.IP , function(){
	console.log("Hey Server is connected") 	
});

//====================================================================================================//