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

router.post('/browsing', function(req, res, next){
  
  var user = req.user;
  
  console.log(req.body);
  
  var selected 	= req.body.devices;
  var family 	= req.body.family;
  var from 	 	= req.body.from ? parseInt(req.body.from) : null;
  var to   		= req.body.to ? parseInt(req.body.to) : null;
  
  Device.findDevicesForUser(family).then(function(results){
	return results.map(function(device){
		return family + "." + device.devname;
	});
  })
  .then(function(devices){
  	return [devices, pgdb.fetch_device_ids_for_selected(selected)]
  })
  .spread(function(devices, deviceids){
  	return [devices, deviceids, to ? {ts:to} : pgdb.fetch_max_ts_for_devices(deviceids)];
  })
  .spread(function(devices, deviceids, max){
    return [devices, deviceids, max.ts, from ? {ts:from} : pgdb.fetch_min_ts_for_deviceids(deviceids, max.ts-SINCE)];
  })
  .spread(function(devices, deviceids, maxts, min){
  	var difference = maxts-min.ts;
    var timerange = {from:min.ts, to:maxts};

    var bin = difference >= (6 * 60 * 60) ? 60*60 : difference > (2 * 60) ? 60 : 1;
	var binnedtimerange = {from: parseInt(min.ts/bin)*bin, to: parseInt(maxts/bin)*bin}
	   
    return [
    			devices,
    			bin,
    			binnedtimerange, 
    			pgdb.fetch_binned_browsing_for_devices(deviceids, bin, timerange.from, timerange.to), 
    			pgdb.fetch_urls_for_devices(deviceids, timerange.from, timerange.to)
    		];
  })
  .spread(function(devices,bin,timerange,binned,urls){
    res.send({
    			browsing:{
      						timerange: timerange,
      						bin: bin,
      						binned  : binned,
      					},
      			urls: urls,
      			devices: devices,
      			selected: selected,
      			
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

router.post('/location', function(req,res, next){
  //var from = req.query.from;
  //var to   = req.query.to;
  var devices = req.body.devices;
  pgdb.fetch_device_ids_for_selected(devices).then(function(deviceids){
  	return deviceids;
  }).then(function(deviceids){
   	return pgdb.fetch_locations_for_devices(deviceids);
  }).then(function(data){
  	res.send({locations:data});
  });
});

router.post('/browsinginlocation', function(req,res,next){
	var family 	= req.body.family;
	var selected = req.body.devices;
	var lat = req.body.lat;
	var lng = req.body.lng;
	
	pgdb.fetch_device_ids_for_selected(selected).then(function(selected){
		return pgdb.fetch_browsing_in_location_for_devices(selected, lat, lng);	
	}).then(function(results){
		res.send(results);
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


router.post('/urls/history', function(req,res, next){
    var url = req.body.url;
    var devices = req.body.devices;
    
    pgdb.fetch_device_ids_for_selected(devices).then(function(deviceids){
  		return deviceids;
  	}).then(function(deviceids){
  		return pgdb.fetch_ts_for_url(deviceids, url)
  	}).then(function(ts){
        res.send({
          timestamps:ts
        });
    });
});

router.post('/urls/unclassified', function(req,res, next){
    var devices = req.body.devices;
    
    pgdb.fetch_device_ids_for_selected(devices).then(function(deviceids){
  		return deviceids;
  	}).then(function(deviceids){
  		return pgdb.fetch_unclassified_for_devices(deviceids);
  	}).then(function(urls){
        res.send(urls);
    });
});

router.post('/categories', function(req,res, next){
	
	var devices = req.body.devices;	
	var classifier = req.body.classifier || null;
	
	pgdb.fetch_device_ids_for_selected(devices).then(function(deviceids){
  		return deviceids;
  	}).then(function(deviceids){
    	return pgdb.fetch_categories_for_devices(deviceids, classifier)
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
   
   
   pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
   }).then(function(deviceid){
   		return pgdb.fetch_matching_categories_for_device(partial, deviceid)
   	}).then(function(categories){
      	res.send(categories);
   	});
});

module.exports = router;
