var http = require('http');
var express = require('express');
var bodyparser = require('body-parser');
var hbs = require('hbs');
var db = require('./db');
var pgdb = require('./pgdb');
var util = require('./util');
var User 	= require('./models/User');
var Device = require('./models/Device');


var app = express();

//to support POSTs

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/viz/', express.static("static"));
app.set('view engine', 'jade');

app.engine('html', hbs.__express);
var server = http.createServer(app);
var SINCE = (365/2) * 24 * 60 * 60;

var hosts = [/*"10.2.0.6",*/ "10.2.0.5", /*"10.1.0.6",*/ "10.1.0.5"];
var device = 2;


app.get('/viz/admin', function(req,res){
	
	User.findAllUsers().then(function(users){
		return users;
	})
	.then(function(users){
		return Promise.all(users.map(function(user){
			return Promise.all([user.username, user.familyname, Device.findDevicesForUser(user.username)]);
		}));
		
	}).then(function(results){
		var families = results.map(function(result){
			return {username:result[0], family:result[1], devices: result[2].map(function(device){
				return device.devname;
			})};
		});
		
		res.render("admin", {families:families});
	});
});

app.get('/viz/test', function(req, res){
  pgdb.fetch_max_ts_for_device(device).then(function(max){
  	  return max;	
	 
  }).then(function(max){
  	 return [max.ts, pgdb.fetch_min_ts_for_device(device, max.ts-SINCE)];
  }).spread(function(maxts, min){
  	 res.send({success:true, data:{from:maxts, to:min[0].ts}});
  });
}),

app.get('/viz/browsing', function(req,res){
  var device = req.query.device;
  
  pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  	return deviceid;
  })
  .then(function(deviceid){
  	
  	return [deviceid, pgdb.fetch_max_ts_for_device(deviceid)];
  })
  .spread(function(deviceid, max){
  
    return [deviceid, max.ts, pgdb.fetch_min_ts_for_device(deviceid, max.ts-SINCE)];
  })
  .spread(function(deviceid, maxts, min){
    var timerange = {from:min.ts, to:maxts};
    var bin = 60 * 60;
    return [bin,timerange,pgdb.fetch_binned_browsing_for_device(deviceid, bin, timerange.from, timerange.to)];
  })
  .spread(function(bin,timerange, binned){
    res.send({
      timerange: timerange,
      bin: bin,
      binned  : binned,
    });
  });
});

app.get('/viz/activity', function(req,res){
  pgdb.fetch_max_ts_for_device(device).then(function(max){
    return [max.ts, pgdb.fetch_min_ts_for_device(device, max.ts-SINCE)];
  }).spread(function(maxts, min){
    var timerange = {from:min.ts, to:maxts};
  	return pgdb.fetch_activity_for_device(device, timerange.from, timerange.to);  
  }).then(function(data){
  	res.send(data);
  });	
});

app.get('/viz/urls', function(req,res){

    var fromts = req.query.from;
    var tots = req.query.to;
    var device = req.query.device;
    
    pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
  		return pgdb.fetch_urls_for_device(deviceid, fromts, tots);
  	}).then(function(urls){
        res.send({
          urls:urls
        });
    });
}),


app.get('/viz/urls/history', function(req,res){
    var url = req.query.url;
    var device = req.query.device;
    
    pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
  		return pgdb.fetch_ts_for_url(deviceid, url)
  	}).then(function(ts){
        res.send({
          timestamps:ts
        });
    });
}),

app.get('/viz/categories', function(req,res){
	
	var device = req.query.device;
	
	pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
    	return pgdb.fetch_categories_for_device(deviceid)
    }).then(function(categories){
        res.send(categories);
    });
}),

app.get('/viz/categories/match', function(req, res){
   var partial = req.query.partial;
   db.fetch_matching_categories(partial).then(function(categories){
      res.send(categories);
   });
}),

app.get('/viz/urls/match', function(req,res){
   var partial = req.query.partial;
   db.fetch_matching_categories_for_url(partial, hosts).then(function(categories){
      res.send(categories);
   });
}),

app.get('/hv_old/urls', function(req,res){

    var fromts = req.query.from;
    var tots = req.query.to;
    db.fetch_urls_for_hosts(hosts, fromts, tots).then(function(urls){
        res.send({
          urls:urls
        });
    });
}),



app.get('/hv_old/urls/history', function(req,res){
    var url = req.query.url;
    db.fetch_ts_for_url(hosts, url).then(function(ts){
        res.send({
          timestamps:ts
        });
    });
}),

app.get('/hv_old/browsing', function(req,res){
  db.fetch_max_ts_for_hosts(hosts).then(function(max){
      return [max.ts, db.fetch_min_ts_for_hosts(hosts, max.ts-SINCE)];
  //db.fetch_latest_ts_for_hosts(hosts).then(function(to){
    //return {from:to.ts - AWEEKAGO, to:to.ts}
  }).spread(function(maxts, min){
    var timerange = {from:min.ts, to:maxts};
    var bin = 60 * 60;
    return [bin,timerange,db.fetch_binned_browsing_for_hosts(hosts, bin, timerange.from, timerange.to)];
  }).spread(function(bin,timerange, binned){
    res.send({
      timerange: timerange,
      bin: bin,
      binned  : binned,
    });
  });
});

server.listen(8001);
