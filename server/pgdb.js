var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");

var db = Promise.promisifyAll(pg);


//var _client = new pg.Client(config.database.url);

var _execute_sql = function(sql,params){
	if (!params){
		params = []
	}
	return db.connectAsync(config.database.url).spread(function(connection, release){
		return connection.queryAsync(sql,params)
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
	
	fetch_max_ts_for_device: function(deviceid){
		var sql = "SELECT max(h.timestamp/1000) as ts FROM http3 h WHERE id=$1";
		var params = [deviceid];
		return _execute_sql(sql,params).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_min_ts_for_device: function(deviceid, smallest){
		var sql = "SELECT min(h.timestamp/1000) as ts FROM http3 h WHERE id=$1 AND h.timestamp/1000 >= $2";
		var params = [deviceid,smallest];
		return _execute_sql(sql,params).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_binned_browsing_for_device: function(deviceid, bin, from, to){
		var sql = "SELECT (timestamp/1000/$1) * $2 as bin, id as host,  COUNT(DISTINCT httphost) as total from http3 WHERE id = $3 AND (timestamp/1000 >= $4 AND timestamp/1000 <= $5) GROUP BY id, bin ORDER BY id, bin";
      	var params = [bin,bin,deviceid,from,to]
      	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
	fetch_urls_for_device: function(deviceid, from, to){
		var sql = "SELECT httphost as url, count(DISTINCT(timestamp/1000)) as total from http3 WHERE id=$1 AND (timestamp/1000 >= $2 AND timestamp/1000 <= $3) GROUP BY httphost ORDER BY total DESC ";
     	var params = [deviceid,from,to];
     	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
    fetch_unclassified_for_device: function(deviceid){
    	var sql="SELECT h.httphost as url, count(h.httphost) as count FROM http3 h LEFT JOIN CLASSIFICATION c ON (c.deviceid = h.id AND h.httphost = c.tld) WHERE id=$1 AND c.success = 0 or c.success IS NULL GROUP BY h.httphost ORDER BY count DESC";
      	var params = [deviceid];
      	return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				return result.url;
			});
		});
    },
	
	fetch_ts_for_url: function(deviceid, url){
	 	var sql = "SELECT timestamp/1000 as ts from http3 WHERE id=$1 AND httphost=$2 ORDER BY timestamp ASC ";
     	var params = [deviceid, url];
     	return _execute_sql(sql,params).then(function(results){
     		
			return results.map(function(result){
				return result.ts;
			});
		});
	},
	
	fetch_activity_for_device: function(deviceid, from, to){
		var bin = 5*60 // 5 minute bins
		var sql = "SELECT name, fullscreen, (timestamp/1000/$1) * $2 as ts FROM activity WHERE id=$3 AND (timestamp/1000 >= $4 AND timestamp/1000 <= $5) GROUP BY name,ts, fullscreen ORDER BY name, ts" 
		var params = [bin, bin, deviceid, from, to]
		
		return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},  
	
	fetch_locations_for_device: function(deviceid, from, to){
		
		var sql = "SELECT name, enter, exit, lat, lng FROM ZONES where deviceid=$1";
		var params = [deviceid];
		
		if (from && to){
			sql += " AND (enter >= $2 AND exit <= $3)";
			params = [deviceid,from,to]
		}
		
		
		return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				return {
					name: result.name.trim() === "" ? result.lat+","+result.lng : result.name,
					enter: parseInt(result.enter),
					exit:  parseInt(result.exit),
				}
			});
		});
	},
	
	fetch_device_id_for_device: function(device){
	
		var sql = "SELECT id FROM devices WHERE devicename=$1";
		var params = [device];
		
		return _execute_sql(sql,params).then(function(results){
			return results.reduce(function(acc, obj){
				return obj.id || null;
			},null);
		});
	},
	
	fetch_categories_for_device: function(deviceid){
		
      	var sql="SELECT classification, array_agg(distinct httphost) AS tld, count(httphost) as size FROM CLASSIFICATION c, http3 h WHERE c.success = 1 AND c.tld=h.httphost AND h.id=$1  AND h.id=c.deviceid GROUP BY classification";
      	var params = [deviceid];
      	
      	return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				var classification = result.classification.split("/");
            	classification.shift();
				return {classification:classification, tld:result.tld, size:parseInt(result.size)};
			});
		});
	},
	
	/*
	 * This needs to pull from a full categorisation dataset!
	 */
	fetch_matching_categories: function(partial){
		var sql = "SELECT DISTINCT(classification) FROM CLASSIFICATION WHERE classification LIKE $1";
		var params = ['%'+partial+'%'];
       	return _execute_sql(sql,params).then(function(results){
       		return results;
       	});
	},
	
	fetch_matching_categories_for_device: function(partial, deviceid){
		var sql = "SELECT DISTINCT(h.httphost) as tld, c.classification FROM http3 h LEFT JOIN CLASSIFICATION c ON c.tld = h.httphost WHERE h.httphost LIKE $1 AND h.id=$2 AND c.success = 1";
       	var params = ['%'+partial+'%',deviceid];
    
       	return _execute_sql(sql,params).then(function(results){
       		return results;
       	});
	},
	
	insert_token_for_device: function(deviceid, api, token){
		
		var sql = "SELECT * FROM tokens WHERE deviceid =$1 AND api =$2";
		var params = [deviceid, api];
		
		return _execute_sql(sql,params).then(function(result){
			if (result.length > 0){
			   sql = "UPDATE tokens SET token = $1, lastupdate=$2 WHERE deviceid =$3 AND api =$4"; 
			   params = [token,Date.now(),deviceid,api]	
			}else{
			   sql = "INSERT INTO tokens (deviceid, api, token,lastupdate) VALUES ($1,$2,$3,$4)";
			   params = [deviceid,api,token, Date.now()];
			}
			return _execute_sql(sql,params);
		}).then(function(result){
			return true;
		});
		
	},
	
	insert_classification_for_device: function(deviceid, classifier, urls, classification){
		
		var results = urls.map(function(url){
		  	sql = "INSERT INTO CLASSIFICATION (deviceid, tld, success, classifier, score, classification) VALUES ($1,$2,$3,$4,$5,$6)"
			params = [deviceid,url, 1, classifier, 1.0, classification]
			return _execute_sql(sql,params);
		});

		Promise.all(results).then(function(results){
		 	return results;	
		}, function(err){
		   console.log(err);
		   throw(err);
		});
		
	},
	
	update_classification_for_device: function(deviceid, classifier, urls, classification){
		
		var results = urls.map(function(url){
		  	sql = "UPDATE CLASSIFICATION SET classification=$1, classifier=$2, score=$3 WHERE deviceid=$4 AND tld=$5"
			params = [classification, classifier, 1, deviceid,url]
			return _execute_sql(sql,params);
		});

		return Promise.all(results).then(function(results){
		 	return results;	
		}, function(err){
		   console.log(err);
		   throw(err);
		});
		
	},
	
}
