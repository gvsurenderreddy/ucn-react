var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');

var SINCE = (365/2) * 24 * 60 * 60  * 1000;

//all requests to /viz will go here...
router.use(function(req, res, next) {
    if (!req.user) {
    	 return res.redirect("/ucn/auth/login");
    }
    next();
});


router.get('/', function(req,res,next){
	var user = req.user;
	console.log("seen user");
	console.log(req.user);
	
	return Device.findDevicesForUser(user.username).then(function(results){
		var devices = results.map(function(device){
			return device.devname;
		});
		var families = [{username:user.username, family:user.familyname, devices: devices}];
		res.render("admin", {families:families});
	});
});

/*router.get('/', function(req,res,next){
	console.log(req.user);
});*/

router.get('/device', function(req, res, next){
	//get and display all devices for this user
	res.render('device')
});

router.get('/browsing', function(req,res, next){
  var device = req.query.device;
  var from = req.query.from ? parseInt(req.query.from) : null;
  var to   = req.query.to ? parseInt(req.query.to) : null;
  
  if (from && to){
  	console.log(req.query.from + "->" + req.query.to);
  }
  console.log("getting browsing data for " + device);

  pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  	console.log("deviceid is " + deviceid);
  	return deviceid;
  })
  .then(function(deviceid){
  	
  	return [deviceid, req.query.to ? {ts:to} : pgdb.fetch_max_ts_for_device(deviceid)];
  })
  .spread(function(deviceid, max){
  
    return [deviceid, max.ts, req.query.from ? {ts:from} : pgdb.fetch_min_ts_for_device(deviceid, max.ts-SINCE)];
  })
  .spread(function(deviceid, maxts, min){
  	var difference = maxts-min.ts;
    var timerange = {from:min.ts, to:maxts};

    var bin = difference >= (6 * 60 * 60) ? 60*60 : difference > (2 * 60) ? 60 : 1;
	var binnedtimerange = {from: parseInt(min.ts/bin)*bin, to: parseInt(maxts/bin)*bin}
	   
    return [
    			bin,
    			binnedtimerange, 
    			pgdb.fetch_binned_browsing_for_device(deviceid, bin, timerange.from, timerange.to), 
    			pgdb.fetch_urls_for_device(deviceid, timerange.from, timerange.to)
    		];
  })
  .spread(function(bin,timerange,binned,urls){
    res.send({
    			browsing:{
      						timerange: timerange,
      						bin: bin,
      						binned  : binned,
      					},
      			urls: urls
    });
  });
});

router.get('/activity', function(req,res, next){
  pgdb.fetch_max_ts_for_device(device).then(function(max){
    return [max.ts, pgdb.fetch_min_ts_for_device(device, max.ts-SINCE)];
  }).spread(function(maxts, min){
    var timerange = {from:min.ts, to:maxts};
  	return pgdb.fetch_activity_for_device(device, timerange.from, timerange.to);  
  }).then(function(data){
  	res.send(data);
  });	
});

router.get('/location', function(req,res, next){
  var from = req.query.from;
  var to   = req.query.to;
  var device = req.query.device;
  
  pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  	return deviceid;
  }).then(function(deviceid){
   	return pgdb.fetch_locations_for_device(deviceid, from, to);
  }).then(function(data){
  	res.send({locations:data});
  });
});


router.get('/urls', function(req,res, next){

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
});


router.get('/urls/history', function(req,res, next){
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
});

router.get('/urls/unclassified', function(req,res, next){
    var device = req.query.device;
    
    pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
  		return pgdb.fetch_unclassified_for_device(deviceid);
  	}).then(function(urls){
        res.send(urls);
    });
});

router.get('/categories', function(req,res, next){
	
	var device = req.query.device;
	var classifier = req.query.classifier || null;
	
	pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
    	return pgdb.fetch_categories_for_device(deviceid, classifier)
    }).then(function(categories){
        res.send(categories);
    });
});

router.get('/categories/match', function(req, res){
	
	var partial = req.query.partial;
	
	pgdb.fetch_matching_categories(partial).then(function(categories){
      res.send(categories);
   	});
});

router.post('/categories/categorise', function(req, res){
	var urls = req.body.urls;
	var category = req.body.category;
	var device = req.body.device;
	
	pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
   	}).then(function(deviceid){
   		return [deviceid, pgdb.update_classification_for_device(deviceid, 'user', urls, category)]
   	}).spread(function(deviceid, results){
   		return pgdb.fetch_categories_for_device(deviceid)
    }).then(function(categories){
    	
        res.send(categories);
    }, function(err){
   		res.send({success:false, error:err});
   		return;
   	});
});



//need to get hosts here...
router.get('/urls/match', function(req,res){
	
   var partial = req.query.partial;
   var device = req.query.device;
   
   console.log("getting matching URLS for " + device + " partial: " + partial);
   
   pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
   }).then(function(deviceid){
   		return pgdb.fetch_matching_categories_for_device(partial, deviceid)
   	}).then(function(categories){
   		console.log(categories);
      	res.send(categories);
   	});
});

module.exports = router;
