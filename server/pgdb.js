var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");

var db = Promise.promisifyAll(pg);


//var _client = new pg.Client(config.database.url);
var _translate = function(classification){
	
	if (classification === "/technology and computing/internet technology/social network")
		return "/social network";
		
	return classification;	
}

var _gettotal = function(counts, tlds){
	
	return tlds.reduce(function(acc, item){
		return acc + (parseInt(counts[item]) || 0);
	},0);
}

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

var _print_query = function(sql, params){
	var query = params.reduce(function(acc, param, index){
		return acc.replace("$"+(index+1), "'"+param+"'");
	},sql);
	console.log("******");
	console.log(query);
	console.log("*******");
};

var _convert_to_tuple = function(devices){
	return "(" + devices.map(function(item){return "'" + item + "'"}).join(",") + ")";
};

module.exports = {

	fetch_hosts: function(){
		var sql = "SELECT * FROM browsing LIMIT 10";
		return _execute_sql(sql).then(function(results){
			return results;
		});
	},
	
	fetch_max_ts_for_device: function(deviceid){
		var sql = "SELECT max(h.timestamp/1000) as ts FROM browsing h WHERE id=$1";
		var params = [deviceid];
		return _execute_sql(sql,params).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_max_ts_for_devices: function(deviceids){
		var sql = "SELECT max(h.timestamp/1000) as ts FROM browsing h WHERE id IN " + _convert_to_tuple(deviceids);
		
		return _execute_sql(sql).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_min_ts_for_device: function(deviceid, smallest){
		var sql = "SELECT min(h.timestamp/1000) as ts FROM browsing h WHERE id=$1 AND h.timestamp/1000 >= $2";
		
		var params = [deviceid,smallest];
		
		return _execute_sql(sql,params).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_min_ts_for_deviceids: function(deviceids, smallest){
		var sql = "SELECT min(h.timestamp/1000) as ts FROM browsing h WHERE id IN " + _convert_to_tuple(deviceids) + " AND h.timestamp/1000 >= $1";
		
		var params = [smallest];
		
		return _execute_sql(sql,params).then(function(results){
			return results[0] || {};
		});
	},
	
	fetch_binned_browsing_for_device: function(deviceid, bin, from, to){
		var sql = "SELECT (timestamp/1000/$1) * $2 as bin, id as host,  COUNT(DISTINCT httphost) as total from browsing WHERE id = $3 AND (timestamp/1000 >= $4 AND timestamp/1000 <= $5) GROUP BY id, bin ORDER BY id, bin";
      	var params = [bin,bin,deviceid,from,to]
      	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
	fetch_binned_browsing_for_devices: function(deviceids, bin, from, to){
		var sql = "SELECT (timestamp/1000/$1) * $2 as bin, id as host,  COUNT(DISTINCT httphost) as total from browsing WHERE id IN " + _convert_to_tuple(deviceids) + " AND (timestamp/1000 >= $3 AND timestamp/1000 <= $4) GROUP BY id, bin ORDER BY id, bin";
      	var params = [bin,bin,from,to]
      	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
	fetch_urls_for_device: function(deviceid, from, to){
		var sql = "SELECT httphost as url, count(DISTINCT(timestamp/1000)) as total from browsing WHERE id=$1 AND (timestamp/1000 >= $2 AND timestamp/1000 <= $3) GROUP BY httphost ORDER BY total DESC ";
     	var params = [deviceid,from,to];
     	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
	fetch_urls_for_devices: function(deviceids, from, to){
		var sql = "SELECT httphost as url, count(DISTINCT(timestamp/1000)) as total from browsing WHERE id IN " + _convert_to_tuple(deviceids) + " AND (timestamp/1000 >= $1 AND timestamp/1000 <= $2) GROUP BY httphost ORDER BY total DESC ";
     	var params = [from,to];
     	//_print_query(sql,params);
     	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
    fetch_unclassified_for_device: function(deviceid){
    	var sql="SELECT h.httphost as url, count(h.httphost) as count FROM browsing h LEFT JOIN CLASSIFICATION c ON (c.deviceid = h.id AND h.httphost = c.tld) WHERE id=$1 AND (c.success = 0 OR c.success IS NULL) GROUP BY h.httphost ORDER BY count DESC";
      	var params = [deviceid];
      	//_print_query(sql,params);
      	return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				return result.url;
			});
		});
    },
	
	fetch_ts_for_url: function(deviceids, url){
	 	var sql = "SELECT timestamp/1000 as ts from browsing WHERE id IN " + _convert_to_tuple(deviceids) + " AND httphost=$1 ORDER BY timestamp ASC ";
     	var params = [url];
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
	
	fetch_locations_for_devices: function(deviceids){
		var sql = "SELECT name, enter, exit, lat, lng FROM ZONES where deviceid IN " +  _convert_to_tuple(deviceids);
		return _execute_sql(sql).then(function(results){
			return results.map(function(result){
				return {
					name: result.name.trim() === "" ? result.lat+","+result.lng : result.name,
					lat: result.lat,
					lng: result.lng,
					enter: parseInt(result.enter),
					exit:  parseInt(result.exit),
				}
			});
		});
	},
	
	/*fetch_locations_for_device: function(deviceid, from, to){
		
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
					lat: result.lat,
					lng: result.lng,
					enter: parseInt(result.enter),
					exit:  parseInt(result.exit),
				}
			});
		});
	},*/
	
	fetch_browsing_in_location_for_devices: function(deviceids, lat, lng){
		var sql = "SELECT b.httphost as url, count(DISTINCT(b.timestamp/1000)) as total from browsing b, zones z WHERE"
		sql += " b.id IN " + _convert_to_tuple(deviceids) + " AND"; 
		sql += " b.id = z.deviceid AND z.lat::numeric=$1 AND z.lng::numeric=$2 AND (b.timestamp/1000  >= z.enter AND b.timestamp/1000 <= z.exit)"
		sql += " GROUP BY httphost ORDER BY total DESC ";
     	var params = [lat,lng];
     	_print_query(sql,params);
		return _execute_sql(sql,params).then(function(results){
			return results;	
		});
	},

	
	fetch_device_ids_for_selected: function(selected){
		var sql = "SELECT id FROM devices WHERE devicename IN " + _convert_to_tuple(selected);
		console.log(sql);
		//var params = [_convert_to_tuple(selected)];
		//_print_query(sql,params);
		return _execute_sql(sql).then(function(results){
			console.log(results);
			return results.map(function(device){
				return device.id;
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
	
	fetch_categories_for_device: function(deviceid, classifier){
		
		var sql,params;
		
		var tldcount = "SELECT httphost, count(httphost) as count FROM browsing WHERE id=$1 GROUP BY httphost";
		var tldparams = [deviceid];
		
		if (!classifier){
			sql = "SELECT c.classification, array_agg(distinct c.tld) AS tld FROM CLASSIFICATION c WHERE deviceid=$1 AND c.success=1 GROUP BY c.classification"
			params = [deviceid]
		}else{
			sql = "SELECT c.classification, array_agg(distinct c.tld) AS tld FROM CLASSIFICATION c WHERE c.classifier=$1  AND deviceid=$2 AND c.success=1 GROUP BY c.classification"
			params= [classifier, deviceid]
		}
		
		//first get the counts of all tlds
		
		return _execute_sql(tldcount, tldparams).then(function (results){
			return results.reduce(function(acc, item){
				acc[item.httphost] = item.count; 
				return acc;
			},{});
		}).then(function(counts){
			return [counts, _execute_sql(sql,params)];
		})
		.spread(function(counts, results){
			return results.map(function(result){
				result.classification = _translate(result.classification);
				var classification = result.classification.split("/");
            	classification.shift();
				return {classification:classification, tld:result.tld, size:_gettotal(counts, result.tld)};
			});
		});
		
		/*if (!classifier){
      		sql="SELECT c.classification, array_agg(distinct c.tld) AS tld, count(h.httphost) AS size FROM CLASSIFICATION c, browsing h WHERE  h.httphost=c.tld  AND  c.deviceid = $1 AND c.success=1 GROUP BY c.classification";
      		params = [deviceid];
      	}else{
      		sql="SELECT c.classification, array_agg(distinct c.tld) AS tld, count(h.httphost) AS size FROM CLASSIFICATION c, browsing h WHERE  h.httphost=c.tld  AND  c.classifier=$1 AND c.deviceid = $2 AND c.success=1 GROUP BY c.classification";
      		params = [classifier,deviceid];
      	}*/
      	
      	
      	/*
      	return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				result.classification = _translate(result.classification);
				var classification = result.classification.split("/");
            	classification.shift();
				return {classification:classification, tld:result.tld, size:parseInt(result.size)};
			});
		});*/
	},
	
	/*
	 * This needs to pull from a full categorisation dataset!
	 */
	fetch_matching_categories: function(partial){
		var sql = "SELECT DISTINCT(classification) FROM CLASSIFICATION WHERE classification LIKE $1 ORDER BY classification ASC";
		var params = ['%'+partial+'%'];
       	return _execute_sql(sql,params).then(function(results){
       		return results;
       	});
	},
	
	fetch_matching_categories_for_device: function(partial, deviceid){
		//var sql = "SELECT DISTINCT(h.httphost) as tld, c.classification FROM browsing h LEFT JOIN CLASSIFICATION c ON c.tld = h.httphost WHERE h.httphost LIKE $1 AND h.id=$2 AND c.success = 1";
       	var sql = "SELECT c.tld, c.classification FROM classification c where c.deviceid=$1 AND c.tld LIKE $2 AND c.success= 1";
       	var params = [deviceid,'%'+partial+'%'];
    	//_print_query(sql,params);
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
		  	var sql = "INSERT INTO CLASSIFICATION (deviceid, tld, success, classifier, score, classification) VALUES ($1,$2,$3,$4,$5,$6)"
			var params = [deviceid,url, 1, classifier, 1.0, classification]
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
			  	
		//ok - need to check if exists first and if not, create!
		var results = urls.map(function(url){
			var sql = "SELECT * FROM classification WHERE deviceid =$1 AND tld =$2";
		  	var params = [deviceid, url];
		  	//_print_query(sql,params);
		  	
		  	return _execute_sql(sql, params).then(function(result){
		  		
		  		if (result.length > 0){
		  			sql = "UPDATE CLASSIFICATION SET classification=$1, classifier=$2, success=1, score=$3, error='' WHERE deviceid=$4 AND tld=$5"
					params = [classification, classifier, 1, deviceid,url]
				}else{
					sql = "INSERT INTO CLASSIFICATION (deviceid, tld, success, classifier, score, classification) VALUES ($1,$2,$3,$4,$5,$6)"
					params = [deviceid,url, 1, classifier, 1.0, classification]
				}
				//_print_query(sql,params);
				return _execute_sql(sql,params);
			});
		});

		return Promise.all(results).then(function(results){
		 	return results;	
		}, function(err){
		   console.log(err);
		   throw(err);
		});
		
	},
	
}
