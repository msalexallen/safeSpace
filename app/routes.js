var dashCont = null;
var fs = require('fs');
var sys = require('sys');
var sqlite3 = require('sqlite3').verbose();
var mkdirp = require('mkdirp');

var file = "userDatabase.db";
var fs = require("fs");;
var db = new sqlite3.Database(file);

module.exports = function(app, passport) {

	//Default page is always index
	app.get('/', function(req, res) {
		res.render('index.ejs');
		req.session.username = null;
		req.session.password = null;
	});

	//Get user allows us to authenticate the user before 
	// we redirect to the password login
	app.get('/login/username', function(req, res) {
		res.render('getun.ejs', { message: req.flash('loginMessage') }); 
	});

	app.post('/login/username', function(req,res) {
		user = req.body.username;
		//add in an if username is a string of only numbers and letters
		if (/^\w+$/.test(user)){
			db.all("SELECT * FROM local WHERE username = '"+user+"'", function(err, rows) {
	            if (err){
	                console.log(err)
	                res.redirect('/');
	            }
	            if (rows == 0){
	                console.log("Exists");
	                res.render('getun.ejs', { message: 
	                	req.flash('loginMessage', 'That username does not exist.') });
	            } else {
					req.session.username = user;
					req.session.password = rows[0].password;
					res.redirect('/login/passimg');
				}
			});
		}
		else {
			res.render('getun.ejs', { message: 'Dost thou not knoweth thine own username?' });
		}
	});

	//Serve the user image from the session (and make a fuss if a session username isn't set)
	app.get('/login/image.png', function(req, res) {
		user = req.session.username;
		if (user != null){
			res.sendfile('./userFiles/'+user+'/passImg.png');
			//res.end('./userFiles/'+user+'/passImg.png', 'binary');
		}
		else{
			res.render('getun.ejs', { message: 'Please enter your username before your password.' });
		}
	});

	//Login handles serving the image and validating the entered points
	app.get('/login/passimg', function(req, res) {
		//res.sendfile
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	app.post('/login/passimg', function(req,res) {
		user = req.session.username;
		pass = req.session.password;
		passPoints = req.body.content;
		if ((user != null) && (pass != null)){
			pass = JSON.parse(pass);
			passPoints = JSON.parse(passPoints);

			if (pass.length == passPoints.length){
				for (i = 0; i < pass.length; i++) {
					if (!(pass[i].x <= passPoints[i].x <= (pass[i].w + pass[i].x)) ||
						!(pass[i].y <= passPoints[i].y <= (pass[i].h + pass[i].y))){
						res.render('login.ejs', { message: 'Invalid password.' });
					} 
				}
				res.redirect('/login/success');
			}
			else{
				res.render('login.ejs', { message: 'Invalid password.' });
			}
		}
		else{
			res.render('getun.ejs', { message: 'Please enter your username before your password.' });
		}
	});

	//Username handles checking username for valid text and uniqueness
	app.get('/signup/username', function(req, res) {
		res.render('createun.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup/username', function(req,res) {
		user = req.body.username;
		//add in an if username is a string of only numbers and letters
		if (/^\w+$/.test(user)){
			db.all("SELECT * FROM local WHERE username = '"+user+"'", function(err, rows) {
	            if (err){
	                console.log(err)
	                res.redirect('/');
	            }
	            if (rows !=0){
	                console.log("Exists");
	                res.render('createun.ejs', { message: 
	                	req.flash('signupMessage', 'That username is already in use.') });
	            } else {
					req.session.username = user;
					//Create the file and directory to store the image files
					//on the server and fill the file from the buffer
					mkdirp("./userFiles/"+user+"/", function (err) {
					if (err) 
					    console.log(err)
					});
					res.redirect('/signup/passimg');
				}
			});
		} else {
			res.render('createun.ejs', { message: 'Invalid character. Letters and numbers only, please.' });
		}
	});

	//Sign up handles the password image saving, the database entries, and
	//evaluating the password (that one was given)
	app.get('/signup/passimg', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup/passimg', function(req,res) {
		console.log(req.body.passwordImg);
		user = req.session.username;
		console.log(user);
		passShapes = req.body.content;
		var img = req.body.image;
		//Verify that they haven't bypassed the username page
		if (user != null){
			//Verify that the password has at least 3 objects
			if (JSON.parse(passShapes).length > 2){
				//get a base64 buffer of the password image
				var data = img.replace(/^data:image\/\w+;base64,/, "");
				var buf = new Buffer(data, 'base64');

				fs.open('./userFiles/'+user+'/passImg.png', "w");
				fs.writeFileSync('./userFiles/'+user+'/passImg.png', buf);
		        
		        //add the username and stringified password shapes to the database
		        db.all("INSERT INTO local (username, password) VALUES " +
		            "('"+user+"', '"+passShapes+"')", function(err,rows){});

		        //remove the username from the session and send to a success page
				req.session.username = null;
				res.redirect('/signup/success');
			}
			else {
				//Invalid password? Redirect to password page again.
				res.render('signup.ejs', { message: 'Passwords must be three or more regions.' });
			}
		}
		else{
			res.render('createun.ejs', { message: 'Set a username before creating a password.' });
		}
	});

	//A success page for sign up
	app.get('/signup/success', function(req, res) {
		res.render('signupsuccess.ejs');
	});

	app.post('/signup/success', function(req, res) {
		res.redirect('/');
	});

	//A success page for login
	app.get('/login/success', function(req, res) {
		res.render('signupsuccess.ejs');
	});

	app.post('/login/success', function(req, res) {
		res.redirect('/');
	});

}