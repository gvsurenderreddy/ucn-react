var Promise = require("bluebird");
var config = require("./config");
var pg = require("pg");
var ignore = require("./ignore");
var db = Promise.promisifyAll(pg);


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
		var dict = {
		
			"plus": ["communication", "social networking"],
			"facebook": ["communication", "social networking"],
			"linkedin": ["communication", "social networking"],
			"hangouts": ["communication", "social networking"],
			"twitter": ["communication", "social networking"],
			"pinterest": ["communication", "social networking"],
			"instagram": ["communication", "social networking"],
			
			"flickr": ["communication", "images"],
			"tumblr": ["communication", "blog"],
			"blog": ["communication", "blog"],
			"wordpress": ["communication","blog"],
			"skype": ["communication", "conferencing"],
			"mail": ["communication", "email"],
			"email": ["communication", "email"],
			
			"reed.co.uk": ["information", "jobs"],
			"indeed": ["information", "jobs"],
			"job": ["information", "jobs"],
			"candidate": ["information", "jobs"],
			"career": ["information", "jobs"],
			"monster": ["information", "jobs"],
			"appointment": ["information", "jobs"],
			"recruit":["information", "jobs"],
			"hired": ["information", "jobs"],
			"milkround": ["information", "jobs"],
			"talent": ["information", "jobs"],
			"experiencepg.com": ["information", "jobs"],
			"tutor":["information", "tutoring"],
			
			"masters": ["information", "courses"],
			"phd": ["information", "courses"],
			"mba": ["information", "courses"],
			"study" : ["information", "courses"],
			"doctorate": ["information", "courses"],
			"degrees": ["information", "courses"],
			
			"student": ["information", "university"],
			"graduate": ["information", "university"],
			".edu": ["information", "university"],
			".ac.uk": ["information", "university"],
			"ucas" : ["information", "health"],
			
			"trustpilot": ["information", "reviews"],
			"reviews": ["information", "reviews"],
			
			"home": ["information", "property"],
			"fish4": ["information", "property"],
			
			"library": ["information", "books"],
			"book": ["information", "books"],
			"scholar": ["information", "academic"],
			"wiley": ["information", "academic"],
			"science": ["information", "academic"],
			"academic": ["information", "academic"],
			
			"uni": ["information", "university"],
			"news": ["information", "news"],
			"cnbc": ["information", "news"],
			"times": ["information", "news"],
			"press": ["information", "news"],
			"post" : ["information", "news"],
			
			"chronicle": ["information", "news"],
			"today" : ["information", "news"],
			"mirror" : ["information", "news"],
			"reuters" : ["information", "news"],
			"independent.co.uk" :  ["information", "news"],
			"guardian": ["information", "news"],
			"telegraph": ["information", "news"],
			
			"techinsider":["information", "news", "technology"],
			"techcrunch":["information", "news", "technology"],
			"techradar": ["information", "news", "technology"],
			
			"economic": ["information", "finance", "business"],
			"business": ["information", "finance", "business"],
			"forbes":["information", "finance", "business"],
			"bloomburg":["information", "finance", "business"],
			"biz":["information", "finance", "business"],
			
			"stocks": ["information", "finance", "stockmarket"],
			"shares": ["information", "finance", "stockmarket"],
			"invest": ["information","finance", "stockmarket"],
			"market": ["information", "finance", "stockmarket"],
			"wealth": ["information", "finance", "stockmarket"],
			"trading": ["information", "finance", "stockmarket"],
			"nikkei": ["information", "finance", "stockmarket"],
			
			"goldman": ["information", "finance", "banking"],
			"jpmorgan": ["information", "finance", "banking"],
			"chase.com" : ["information", "finance", "banking"],
			"morganstanley": ["information", "finance", "banking"],
			"bankofengland": ["information", "finance", "banking"],
			
			"finan": ["information", "finance"],
			"ft.com": ["information", "finance"],
			"currency" : ["information", "finance"],
			"money":["information", "finance"],
			"weather": ["information", "weather"],
			"accountant": ["information", "finance", "accounting"],
			"accounting": ["information", "finance", "accounting"],
			"accountancy": ["information", "finance", "accounting"],
			"acca": ["information", "finance", "accounting"],
			"acfe":  ["information", "finance", "accounting"],
			"pwc": ["information", "finance", "accounting"],
			
			"programmer": ["information", "technology", "programming"],
			"apple": ["information", "technology", "hardware"],
			"windowsphone": ["information", "technology", "hardware"],
			"health": ["information","health"],
			"clinic": ["information", "health"],
			"diabetes": ["information", "health"],
			"gov.uk": ["information", "government"],
			".gov": ["information", "government"],
			
			"quora": ["information", "forum"],
			"answers": ["information", "forum"],
			"stackexchange":["information", "forum"],
			"stackoverflow":["information", "forum", "tech"],
			"wiki":["information"],
			"reddit":["information", "forum"],
			
			"google.com" : ["support", "search engine"],
			"www.google.com": ["support", "search engine"],
			"www.google.co.uk": ["support", "search engine"],
			"bing.com": ["support", "search engine"],
			"bing.co.uk": ["support", "search engine"],
			"www.yahoo.co.uk": ["support", "search engine"],
			"www.yahoo.com": ["support", "search engine"],
			"ask.com": ["support", "search engine"],
			
			"energy": ["support", "energy"],
			
			"mediafire": ["support", "backups"],
			"icloud": ["support", "backups"],
			"dropbox": ["support", "backups", "documents"],
			"play.google": ["support", "software", "apps"],
			"survey": ["support", "surveys"],
			"gwallet": ["support", "payment"],
			
			"doodle": ["support", "calendar"],
			"calendar": ["support", "calendar"],
			
			"translate": ["support", "translate"],
			
			"shop": ["support", "shopping"],
			"asda": ["support", "shopping"],
			"argos": ["support", "shopping"],
			"tesco": ["support", "shopping"],
			"waitrose": ["support", "shopping"],
			"boots": ["support", "shopping"],
			"amazon": ["support", "shopping"],
			"houseoffraser": ["support","shopping"],
			"barclays":["support", "banking"],
			"santander": ["support", "banking"],
			"lloyds":["support", "banking"],
			"natwest":["support", "banking"],
			"paypal":["support", "banking"],
			 
			 
			 "travel":["support", "travel"],
			"air":["support", "travel"],
			"map":["support", "travel"],
			"booking":["support", "travel"],
			"heathrow":["support", "travel"],
			"gatwick":["support", "travel"],
			
			"workout": ["entertainment", "fitness"],
			
			"car":  ["entertainment", "interest", "cars"],
			"motor": ["entertainment", "interest", "cars"],
			"wheels": ["entertainment", "interest", "cars"],
			"dine" : ["entertainment", "interest", "food"],
			"food" : ["entertainment", "interest", "food"],
			"nutrition": ["entertainment", "interest", "food", "health"],
		
			"holiday": ["entertainment", "travel"],
			"secretescapes" : ["entertainment", "travel"],
			
			"league": ["entertainment", "interest", "sport"],
			"sport": ["entertainment", "interest", "sport"],
			"football": ["entertainment", "interest", "sport", "football"],
			"fashion": ["entertainment", "interest", "fashion"],
			"style": ["entertainment", "interest", "fashion"],
			"celebrity": ["entertainment", "interest", "celebrity"],
			"astro": ["entertainment", "interest", "astrology"],
			"puzzle" :  ["entertainment", "interest", "puzzles"],
			
			"readersdigest": ["entertainment", "interest", "magazine"],
			
			"dating" : ["entertainment", "dating"],
			
			"gamble" : ["entertainment", "gambling"],
			"gambling": ["entertainment", "gambling"],
			"skybet" : ["entertainment", "gambling"],
			
			"flix" : ["entertainment", "streaming"],
			"video": ["entertainment", "films"],
			"movie": ["entertainment", "films"],
			"youtube": ["entertainment", "streaming"],
			"www.vice.com" :["entertainment", "streaming"],
			"itv.com":["entertainment", "streaming"],
			"vimeo" :["entertainment", "streaming"],
			"ustream":["entertainment", "streaming"],
			"destination": ["entertainment", "travel"],
			
			"film": ["entertainment", "films"],
			"game":  ["entertainment", "gaming"],
			"gaming": ["entertainment", "gaming"],
			"music": ["entertainment", "music"],
			"mp3": ["entertainment", "music"],
			"tunes": ["entertainment", "music"],
			
			
			"audible":["entertainment", "audiobook"],
		}
		
		var category = "";
		
		this.categorised(Object.keys(dict).some(function(key){
			//console.log("checking for " + key + " in url " + url);
			if (url.indexOf(key) != -1){
				category = dict[key];
				return true;
			}
			return false;
		}.bind(this)));
		
		return category;
	},
	
	categorise: function(urls){
		var categorised = urls.map(function(url){
			return {url: url.url, category: this.category(url.url), total: url.value};
		}.bind(this));
		console.log("categorised " + _categorised + "(" + ((_categorised/_total)*100) + "% )");
		console.log("uncategorised " + _uncategorised + "(" + ((_uncategorised/_total)*100) + "% )");
		console.log("total " + _total);
		return categorised;
	},
	
	stats_top_urls_for_device: function(deviceid, bin){
		var sql = "SELECT (timestamp/1000/$1) * $2 as bin, id as host,  array_agg(DISTINCT httphost) as total from browsing WHERE id = $3 GROUP BY id, bin ORDER BY id, bin";
      	var params = [bin,bin,deviceid]
      	
      	 _print_query(sql,params);
      	
      	return _execute_sql(sql,params).then(function(results){
			
			var dict = results.reduce(function(acc, row){
				return row.total.reduce(function(acc2, url){
					acc2[url] = acc2[url] ? acc2[url] + 1: 1;
					return acc2;
				},acc);
			},{});
			
			//return dict;
			var added = {}
			var urls = Object.keys(dict).map(function(key){
				return {url: key, value:dict[key]}
			}).filter(function (item){
				if (!ignore.ignore[item.url]){
					added[item.url] = true;
					return true;
				}
				return false;
			});
			
			urls.sort(function(a,b){
				if (a.value < b.value){
					return 1;
				}
				if (a.value > b.value){
					return -1;
				}
				return 0;
			});
			
			urls = urls.filter(function(item){
				return !added["www."+item.url];
			});
			
			console.log(urls.length);
			return this.categorise(urls).filter(function(item){
				return item.category === "";
			});
			
		}.bind(this));
	},
}
