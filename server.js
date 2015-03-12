var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var sqlite3 = require('sqlite3').verbose();
var passport = require('passport');
var flash 	 = require('connect-flash');
var path = require('path');

app.configure(function() {

	//MUST BE THIS ORDER FOR APP STUFF!!
	app.use(express.limit('400mb'));
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'public')));

	app.set('view engine', 'ejs');

	app.use(express.session({ secret: 'sssssshtellnobody' }));
	app.use(flash());
	app.use(app.router);

});

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('The server is running on ' + port);