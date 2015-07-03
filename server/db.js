var Promise = require("bluebird");
var fs = require("fs");
var file = "netdata.db"
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

Promise.promisifyAll(db)

module.exports = {
    
    fetch_hosts: function(){
       db.serialize(function(){
	 var results = []
	 return db.eachAsync("SELECT DISTINCT host FROM urls", function(err,row){
	    results.push(row.host);
	}).then(function(){
	    console.log("got results!");
	    console.log(results);
	    return results;
	});
       });	
    }

}
