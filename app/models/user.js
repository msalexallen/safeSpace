var sqlite3 = require('sqlite3').verbose();
var bcrypt   = require('bcrypt-nodejs');
var fs = require("fs");

var file = "userDatabase.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Creating new user database");
  fs.openSync(file, "w");
}

var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE local(username TEXT, email TEXT, password TEXT);");
  }
})
