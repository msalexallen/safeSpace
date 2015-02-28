var sqlite3 = require('sqlite3').verbose();
var bcrypt   = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../app/models/user');
var file = "userDatabase.db";
var fs = require("fs");;
var db = new sqlite3.Database(file);
var current = null;

hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
validPassword = function(realPassword,password) {
    return bcrypt.compareSync(password, realPassword);
};

module.exports = function(passport) {

    //Serialize function
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //Deserialize function
    passport.deserializeUser(function(id, done) {
        db.all("SELECT * FROM local WHERE username = '"+id+"'", function(err, rows) {
            user = {};
            user.id=id;
            user.name = rows[0].username;
            user.password = rows[0].password;
            user.files = [];
            userData = new sqlite3.Database("./views/userfiles/"+user.name+"/userFiles.db");
            userData.all("SELECT * FROM notes", function(err, rows2) {
                if(rows2){
                    for (var i=0; i<rows2.length; i++){
                        user.files.push(rows2[i].name);
                        user.current = rows2[i].current;
                    }
                }
                else{
                    user.current = null;
                }
                return done(null, user);
            });
            userData.close();
        });
    });

    passport.use('newnote', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {

        console.log("shit");
        username1 = req.user;
        username1 = username1.name;
        userData = new sqlite3.Database("./views/userfiles/"+username1+"/userFiles.db");
        userData.all("SELECT * FROM notes WHERE name = '"+username+"'", function(err, rows) {
            if (rows != 0){
                return done(null, false, req.flash('createMessage', 'File already exists.'));
            }
            else{
                userData.all("INSERT INTO notes (name, current) VALUES " +"('"+username+"', '/userfiles/"+username1+"/"+username+".ejs')", function(err,rows2){});
            }
        userData.close();
        });
        temp = {};
        temp.id = username1;
        return done(null, temp);

    }));



    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {

        db.all("SELECT * FROM local WHERE username = '"+username+"'", function(err, rows) {
            if (err){
                return done(err);
            }

            if (rows.length === 0){
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            if (!validPassword(rows[0].password, password)){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
            var temp = {} ;
            temp.name = username;
            temp.id = username;

            return done(null, temp);
        });

    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {
        process.nextTick(function() {

            db.serialize(function() {
                db.all("SELECT * FROM local WHERE username = '"+username+"'", function(err, rows) {
                    if (err){
                        console.log(err)
                        return done(err)
                    }
                    if (rows !=0){
                        console.log("Exists");
                        return done(null, false, req.flash('signupMessage', 'That username is already in use.'));
                    } else {

                        db.all("INSERT INTO local (username, password) VALUES " +
                            "('"+username+"', '"+hashPassword(password)+"')", function(err,rows){});
                        var temp = {} ;
                        temp.name = username;
                        temp.id = username;

                        var mkdirp = require('mkdirp');
                        mkdirp("./views/userfiles/"+username, function (err) {
                            if (err) 
                                console.log(err)
                        });

                        fs.open("./views/userfiles/"+username+"/userFiles.db", "w");
                        var noteList = new sqlite3.Database("./views/userfiles/"+username+"/userFiles.db");
                        noteList.run("CREATE TABLE notes(name TEXT, current TEXT);");
                        noteList.close();

                        console.log("new user created");
                        return done(null, temp);
                        }
                    }
            ); });

        });

    }));

};