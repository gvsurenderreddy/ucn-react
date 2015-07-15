var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");

Promise.promisifyAll(pg);

var _client = new pg.Client(config.database.url);

_client.connect(function(err){
	console.log(err);
	throw err;
});

module.exports = {

	fetch_hosts: function(){
		var sql = "SELECT * FROM http3 LIMIT 10";
      	return _client.queryAsync(sql).then(function(result){
      		return result.rows;
      	},function(err){
      		console.log(err);
      		throw err;
      	});
    }
}