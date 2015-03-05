var dashCont = null;
var fs = require('fs');
var sys = require('sys');
var sqlite3 = require('sqlite3').verbose();
var mkdirp = require('mkdirp');

module.exports = function(app, passport) {

	//Default page is always index
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	//Get user allows us to authenticate the user before 
	// we redirect to the password login
	app.get('/login/username', function(req, res) {
		res.render('getun.ejs', { message: req.flash('loginMessage') }); 
	});

	app.post('/login/username', function(req,res) {
		req.user = req.body.username;

		res.redirect('/login');
	});

	//Login handles serving the image and validating the entered points
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/dashboard', 
		failureRedirect : '/login', 
		failureFlash : true
	}));

	//Username handles checking username for valid text and uniqueness
	app.get('/signup/username', function(req, res) {
		res.render('createun.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup/username', function(req,res) {
		user = req.body.username;
		req.session.username = user;

		res.redirect('/signup/passimg');
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

		var data = img.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');

		mkdirp("./views/userFiles/"+user+"/", function (err) {
            if (err) 
                console.log(err)
        });
		fs.open('./views/userFiles/'+user+'/passImg.png', "w");
		
		//write the info
		fs.writeFileSync('./views/userFiles/'+user+'/passImg.png', buf);

		req.session.username = null;
		res.redirect('/signup/success');
	});

	//A success page 
	app.get('/signup/success', function(req, res) {
		res.render('signupsuccess.ejs');
	});

	app.post('/signup/success', function(req, res) {
		res.redirect('/');
	});

}

function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}