var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");
var ignore = require("./ignore");
var db = Promise.promisifyAll(pg);
var categorise = require("./categorise");

var _categorised = 0;
var _uncategorised = 0;
var _total = 0;

//var _client = new pg.Client(config.database.url);
var _translate = function(classification){
	if (classification === "/technology and computing/internet technology/email")
		return "/email";
	
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
	if (devices.length <= 0)
		return "(-1)";
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
      	 _print_query(sql,params);
      	return _execute_sql(sql,params).then(function(results){
			return results;
		});
	},
	
	fetch_binned_browsing_for_devices: function(deviceids, bin, from, to){
		var sql = "SELECT (timestamp/1000/$1) * $2 as bin, id as host,  COUNT(DISTINCT httphost) as total from browsing WHERE id IN " + _convert_to_tuple(deviceids) + " AND (timestamp/1000 >= $3 AND timestamp/1000 <= $4) GROUP BY id, bin ORDER BY id, bin";
      	var params = [bin,bin,from,to]
      	_print_query(sql,params);
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
		var sql = "SELECT name, enter, exit, lat, lng FROM ZONES where deviceid IN " +  _convert_to_tuple(deviceids) + " ORDER BY enter ASC ";
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
					lat: result.lat,
					lng: result.lng,
					enter: parseInt(result.enter),
					exit:  parseInt(result.exit),
				}
			});
		});
	},
	
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
		var sql = "SELECT id, devicename FROM devices WHERE devicename IN " + _convert_to_tuple(selected);
		
		return _execute_sql(sql).then(function(results){
			console.log(results);
			return results.map(function(device){
				return {id:device.id, name:device.devicename};
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
	
	fetch_unclassified_for_devices: function(deviceids){
		
    	var sql="SELECT h.httphost as url, count(h.httphost) as count FROM browsing h LEFT JOIN CLASSIFICATION c ON (c.deviceid = h.id AND h.httphost = c.tld) WHERE id IN " + _convert_to_tuple(deviceids) + "  AND (c.success = 0 OR c.success IS NULL) GROUP BY h.httphost ORDER BY count DESC";
      	var params = [];
      	//_print_query(sql,params);
      	return _execute_sql(sql,params).then(function(results){
			return results.map(function(result){
				return result.url;
			});
		});
    },
    
	fetch_categories_for_devices: function(deviceids, classifier){
		
		var sql,params;
		
		var tldcount = "SELECT httphost, count(httphost) as count FROM browsing WHERE id IN " + _convert_to_tuple(deviceids) + " GROUP BY httphost";
		
		if (!classifier){
			sql = "SELECT c.classification, array_agg(distinct c.tld) AS tld FROM CLASSIFICATION c WHERE deviceid IN " + _convert_to_tuple(deviceids) + " AND c.success=1 GROUP BY c.classification"
			params = []
		}else{
			sql = "SELECT c.classification, array_agg(distinct c.tld) AS tld FROM CLASSIFICATION c WHERE c.classifier=$1  AND deviceid IN " + _convert_to_tuple(deviceids) + "  AND c.success=1 GROUP BY c.classification"
			params= [classifier]
		}
		
		//first get the counts of all tlds
		
		return _execute_sql(tldcount).then(function (results){
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
       	var sql = "SELECT DISTINCT(c.tld), c.classification FROM classification c where c.deviceid=$1 AND c.tld LIKE $2 AND c.success= 1";
       	//console.log(sql);
       	var params = [deviceid,'%'+partial+'%'];
    	//_print_query(sql,params);
       	return _execute_sql(sql,params).then(function(results){
       		return results.map(function(item){
       			return{
       				tld: item.tld,
       				classification: _translate(item.classification)
       			}
       		});
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
	
	
	categorised: function(value){
		if (value){
			_categorised += 1;
		}else{
			_uncategorised += 1;
		}
		_total += 1;
	},
	
	category: function(url){
		
		var category = "";
		
		this.categorised(Object.keys(categorise.categories).some(function(key){
			//console.log("checking for " + key + " in url " + url);
			if (url.indexOf(key) != -1){
				category = categorise.categories[key];
				return true;
			}
			return false;
		}.bind(this)));
		
		return category;
	},
	
	categorise: function(urls){
	
		//console.log(categorise.categories);
	
		var categorised = urls.map(function(url){
			return {url: url, category: this.category(url)};
		}.bind(this));
		
		console.log("categorised " + _categorised + "(" + ((_categorised/_total)*100) + "% )");
		console.log("uncategorised " + _uncategorised + "(" + ((_uncategorised/_total)*100) + "% )");
		console.log("total " + _total);
		return categorised;
	},
	
	stats_classify: function(deviceid){
		var sql = "SELECT DISTINCT (httphost) as url from browsing WHERE id = $1";
		var params = [deviceid];
		
		_print_query(sql,params);
      	
      	return _execute_sql(sql,params).then(function(results){
			
			var dict = results.reduce(function(acc, row){
				acc[row.url] = true;
				return acc;
			},{});
			
			//return dict;
			var added = {}
			var urls = Object.keys(dict).map(function(key){
				return key;
			}).filter(function (item){
				if (!ignore.ignore[item]){
					added[item] = true;
					return true;
				}
				return false;
			});
			
			urls.sort(function(a,b){
				if (a < b){
					return 1;
				}
				if (a > b){
					return -1;
				}
				return 0;
			});
			
			urls = urls.filter(function(item){
				return !added["www."+item];
			});
			
			
			var remaining = this.categorise(urls).filter(function(item){
				return item.category == "";
			}).map(function(item){
				return item.url;
			});
			
			var categories = this.categorise(urls).filter(function(item){
				return item.category != "";
			}).map(function(item){
				return {url:item.url, category:item.category.join("/")};
			});
			
			
			var results = categories.map(function(item){
		  		var sql = "INSERT INTO classification_v2 (deviceid, tld, success, classifier, score, classification) SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS (SELECT 1 FROM classification_v2 WHERE deviceid=$7 AND tld=$8) "
				
				var params = [deviceid,item.url, 1, 'user', 1.0, item.category, deviceid, item.url]
				return _execute_sql(sql,params);
			});
		
			return Promise.all(results).then(function(results){
		 		return remaining;	
			}, function(err){
		  	 	console.log(err);
		   		throw(err);
			});
			
		}.bind(this));
	},
	
	
	
	fullstats_histogram_for_device: function(deviceid){
		var sql = "SELECT (b.timestamp) from browsing b WHERE b.id=$1";
		var params = [deviceid]
		
		return _execute_sql(sql,params).then(function(results){
      		var grandtotal = results.length;
      			
      		var binned = results.reduce(function(acc, ts){
      			var key = (new Date(parseInt(ts.timestamp))).getHours();	
      			acc[key] = acc[key] || {total: 0, percent:  0}
      			acc[key].total = acc[key].total + 1;
      			acc[key].percent = (acc[key].total / grandtotal) * 100;
      			return acc;
      		},{});
      		
      		return  Object.keys(binned).map(function(key){
      			return {hour: parseInt(key), value: binned[key].percent}
      		});
		});
	},
		
	
	stats_category_browsing_for_device: function(deviceid, path){
		var sql = "SELECT b.timestamp, c.tld, c.classification from browsing b, classification_v2 c WHERE b.id=$1 AND b.id=c.deviceid AND c.tld = b.httphost AND c.classification LIKE $2";
		
		var params = [deviceid, '%'+path+'%']
      	return _execute_sql(sql,params).then(function(results){
      		return results;
      	});
	},
	
	_zonelookup: function(devices){
		return this.fetch_locations_for_devices(devices).then(function(locations){
			return locations;
		});
	},
	
	_findzone: function(key, _zonelookup){

		var i, z;
		
		for (i=0; i < _zonelookup.length; i++){
			z = _zonelookup[i]; 
			if (z.enter <= key && z.exit >= key){
				break;
			}
		}
		return z;
	},
	
	
	fetch_companion_devices: function(deviceid){
		var sql = "SELECT devicename FROM devices WHERE id = $1"
		var params = [deviceid]; 
		
		return _execute_sql(sql, params).then(function(results){
			return results.reduce(function(acc, obj){
				return obj.devicename;
			},"");
		}).then(function(devicename){
			var username = devicename.split(".")[0];
			var sql = "SELECT id from devices WHERE devicename LIKE $1";
			var params = ['%'+username+".%"]
			
			return _execute_sql(sql, params).then(function(results){
				return results.map(function(item){
					return item.id;
				});
			});
		});
	},
	
	//gives a histogram of browsing in 24 hour bins for a particular category and a breakdown of locations for each 
	
	stats_histogram_for_device: function(deviceid, devices, path){
	
		path = path || "";
		
		return this._zonelookup(devices).then(function(_zonelookup){
			
			var sql = "SELECT b.timestamp, c.tld, c.classification from browsing b,  classification_v2 c WHERE b.id=$1 AND b.id=c.deviceid AND c.tld = b.httphost AND c.classification LIKE $2 ORDER BY c.classification, b.timestamp";
		
			var params = [deviceid, '%'+path+'%']
	  
			return _execute_sql(sql,params).then(function(results){
				
				var grandtotal = results.length;
				
				var binned = results.reduce(function(acc, row){
					var key = (new Date(parseInt(row.timestamp))).getHours();
					acc[key] = acc[key] || {total: 0, percent:  0}
					acc[key].total = acc[key].total + 1;
					acc[key].percent = (acc[key].total / grandtotal) * 100;
					return acc;
				},{});
			
				var browsing = results.reduce(function(acc, row){
					var key = row.classification;
					acc[key] = acc[key] || [];
					acc[key].push({ts:parseInt(row.timestamp), tld:row.tld})
					return acc;
				},{});
			
				var locations = results.reduce(function(acc, row){
					var key = parseInt((parseInt(row.timestamp)/1000));
					var zone = this._findzone(key, _zonelookup);
					if (zone){
						acc[zone.name] = acc[zone.name] || {total: 0, percent:  0}
						acc[zone.name].total += 1;
						acc[zone.name].percent = (acc[zone.name].total / grandtotal) * 100;
					}
					return acc;
				}.bind(this),{});
			
			
			
				var histogram =  Object.keys(binned).map(function(key){
					return {hour: parseInt(key), value: binned[key].percent}
				});
			
				return {histogram:histogram, browsing:browsing, locations:locations}
			}.bind(this));
		}.bind(this));
	},
	
	stats_top_urls_for_device: function(deviceid, bin){
		
		
		var sql = "SELECT (b.timestamp/1000/$1) * $2 as bin, b.id as host,  array_agg(DISTINCT b.httphost) as total from classification_v2 c, browsing b WHERE c.deviceid = $3 AND b.id = c.deviceid AND c.tld = b.httphost GROUP BY id, bin ORDER BY id, bin";
      	
      	
      	var params = [bin,bin,deviceid]
      	
      	 _print_query(sql,params);
      	
      	return _execute_sql(sql,params).then(function(results){
			
			return results.map(function(result){
				return {ts: result.bin, id: result.host, hosts: result.total}
			});
			
		}.bind(this));
	},

	
	stats_categories_for_device: function(deviceid){
			
		var tldcount = "SELECT b.httphost, count(b.httphost) as count FROM classification_v2 c, browsing b WHERE c.deviceid = $1 AND b.id = c.deviceid AND c.tld = b.httphost GROUP BY httphost";
		
		var tldparams = [deviceid]
		
		var sql = "SELECT c.classification, array_agg(distinct c.tld) AS tld FROM classification_v2 c WHERE deviceid = $1 GROUP BY c.classification"
		
		var params = [deviceid]
		
		//first get the counts of all tlds
		
		return _execute_sql(tldcount, tldparams).then(function (results){
			
			return results.reduce(function(acc, item){
				acc[item.httphost] = item.count; 
				return acc;
			},{});
		}).then(function(counts){
			
			_print_query(sql,params);
			return [counts, _execute_sql(sql,params)];
		})
		.spread(function(counts, results){
			
			
			return results.map(function(result){
				var classification = result.classification.split("/");
				return {classification:classification, tld:result.tld, size: _gettotal(counts, result.tld)};
			});
		});
	}
}
