var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");

var db = Promise.promisifyAll(pg);


//var _client = new pg.Client(config.database.url);

var _execute_sql = function(sql){
	
	return db.connectAsync(config.database.url).spread(function(connection, release){
		return connection.queryAsync(sql)
			.then(function(result){
				return result.rows;
			}).finally(function(){
				release();
			});
	},function(err){
		console.log(err);
		throw err;
	});
}

module.exports = {

	fetch_hosts: function(){
		var sql = "SELECT * FROM http3 LIMIT 10";
		return _execute_sql(sql).then(function(results){
			return results;
		});
	},
	
	fetch_max_ts_for_device: function(device){
		var sql = "SELECT max(h.timestamp/1000) as ts FROM http3 h WHERE id=" + device;
		return _execute_sql(sql).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_min_ts_for_device: function(device, smallest){
		var sql = "SELECT min(h.timestamp/1000) as ts FROM http3 h WHERE id=" + device + " AND h.timestamp/1000 >= " + smallest;
		return _execute_sql(sql).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_binned_browsing_for_device: function(device, bin, from, to){
		var sql = "SELECT (timestamp/1000/" + bin + ") * " + bin + " as bin, id as host,  COUNT(httphost) as total from http3 WHERE id = " + device + " AND (timestamp/1000 >= "+from+" AND timestamp/1000 <= "+to+") GROUP BY id, bin ORDER BY id, bin";
      
      	return _execute_sql(sql).then(function(results){
			return results;
		});
	},
	
	fetch_urls_for_device: function(device, from, to){
		var sql = "SELECT httphost as url, count(DISTINCT(timestamp/1000)) as total from http3 WHERE id=" + device + " AND (timestamp/1000 >= "+from+" AND timestamp/1000 <= "+to+") GROUP BY httphost ORDER BY total DESC ";
     	
     	return _execute_sql(sql).then(function(results){
			return results;
		});
	},
	
	fetch_ts_for_url: function(device, url){
	 	var sql = "SELECT timestamp/1000 as ts from http3 WHERE id=" + device + " AND httphost='" + url + "' ORDER BY timestamp ASC ";
     	
     	return _execute_sql(sql).then(function(results){
     		
			return results.map(function(result){
				return result.ts;
			});
		});
	},
	
	fetch_activity_for_device: function(device, from, to){
		var bin = 5*60 // 5 minute bins
		var sql = "SELECT name, fullscreen, (timestamp/1000/" + bin + ") * " + bin + " as ts FROM activity WHERE id=" + device + " AND (timestamp/1000 >= "+from+" AND timestamp/1000 <= "+to+") GROUP BY name,ts, fullscreen ORDER BY name, ts" 
		console.log(sql)
		return _execute_sql(sql).then(function(results){
			return results;
		});
	},  
	
	fetch_device_id_for_device: function(device){
	
		var sql = "SELECT id FROM devices WHERE devicename='" + device + "'";
	
		return _execute_sql(sql).then(function(results){
			return results.reduce(function(acc, obj){
				return obj.id || null;
			},null);
		});
	},
	
	fetch_categories_for_device: function(deviceid){
		
      	//var sql="SELECT classification, array_agg(distinct httphost) AS urls, count(httphost) as total FROM CLASSIFICATION c, http3 h WHERE c.success = 1 AND c.tld=h.httphost AND h.id=" + deviceid + " GROUP BY classification"
      	
      	var sql="SELECT classification, array_agg(distinct httphost) AS tld, count(httphost) as size FROM CLASSIFICATION c, http3 h WHERE c.success = 1 AND c.tld=h.httphost AND h.id=" + deviceid + " GROUP BY classification"
      	
      	return _execute_sql(sql).then(function(results){
			return results.map(function(result){
				var classification = result.classification.split("/");
            	classification.shift();
				return {classification:classification, tld:result.tld, size:parseInt(result.size)};
			});
		});
	},
	
}
