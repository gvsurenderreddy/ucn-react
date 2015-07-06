var Promise = require("bluebird");
var fs = require("fs");
var file = "netdata.db"
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

Promise.promisifyAll(db)

module.exports = {

    //could we do db.allAsync instead here?
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
    },

    fetch_latest_ts_for_hosts: function(hosts){

      var results = [];

      return db.serializeAsync().then(function(){

        var hstr = hosts.map(function(host){return "\'" + host + "\'"}).join();

        //how do we paramaterise this?

        var sql = "SELECT max(u.ts) as ts FROM URLS u WHERE u.host IN (" + hstr + ") AND ts != ''";

        return db.allAsync(sql, function(err,rows){

            if (err){
              return []
            }
            else{
              return rows;
            }
        });
      });
    },

    fetch_browsing_for_hosts: function(hosts, fromts, tots){

    },


}
