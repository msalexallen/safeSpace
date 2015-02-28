var dashCont = null;
var fs = require('fs');
var sys = require('sys');
var sqlite3 = require('sqlite3').verbose();

module.exports = function(app, passport) {

	//Default page is always index
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/dashboard', 
		failureRedirect : '/login', 
		failureFlash : true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/password',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get('/password', isLoggedIn, function(req, res) {
		dashCont = null;
		res.render('dashboard.ejs', { user : req.user });
	});

	app.post('/password', isLoggedIn, function(req, res) {
		dashCont = "/userfiles/"+user.name+"/"+req.body.note+".ejs";
		res.redirect('/note');
	});

	app.post('/delete', isLoggedIn, function(req, res) {
		console.log(req.body.note);
		userData = new sqlite3.Database("./views/userfiles/"+user.name+"/userFiles.db");
		userData.all("DELETE FROM notes WHERE name = '"+req.body.note+"'");
		fs.unlink("./views/userfiles/"+user.name+"/"+req.body.note+".html");
		fs.unlink("./views/userfiles/"+user.name+"/"+req.body.note+".png");
		res.redirect('/dashboard');
	});

	app.get('/note', isLoggedIn, function(req, res) {
		if (dashCont){
			req.user.current = dashCont;
			fs.writeFileSync("./public/temp.png", fs.readFileSync('./views'+dashCont.slice(0, dashCont.length-4)+'.png'));
			fs.open('./views'+dashCont.slice(0, dashCont.length-4)+'.html', "r");
			fs.readFile('./views'+dashCont.slice(0, dashCont.length-4)+'.html', 'utf8', function read(err, html) {
    			if (err) {
        		throw err;
    			}
    			console.log('here');
    			console.log(html);
    			req.user.text = html;
				res.render('notes.ejs', { user: req.user });
    		});
		} else {
			fs.writeFileSync("./public/temp.png", fs.readFileSync('./views/default.png'));
			req.user.text = 'Add text here!';
			dashCont = req.user.current;
			res.render('notes.ejs', { user: req.user });
		}
	});

	app.post('/note', isLoggedIn, function(req, res) {
		console.log(req.body);
		var img = req.body.image;
		var text = req.body.content;
		var data = img.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');

		//Open the files to save the info
		fs.open('./views'+dashCont.slice(0, dashCont.length-4)+'.png', "w");
		fs.open('./views'+dashCont.slice(0, dashCont.length-4)+'.html', "w");
		
		//write the info
		fs.writeFile('./views'+dashCont.slice(0, dashCont.length-4)+'.png', buf);
		fs.writeFile('./views'+dashCont.slice(0, dashCont.length-4)+'.html', text);

		res.redirect('/note');
	});

	app.get('/createnote', isLoggedIn, function(req, res) {
		res.render('createnote.ejs', { message: req.flash('createMessage') });
	});

	app.post('/createnote', passport.authenticate('newnote', {
		successRedirect : '/note',
		failureRedirect : '/createnote',
		failureFlash : true
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}