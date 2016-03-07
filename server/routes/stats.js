var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');

//all requests to /stats will go here...
router.use(function(req, res, next) {
    if (!req.user) {
    	 return res.redirect("/ucn/auth/login");
    }
    next();
});

router.get('/', function(req, res, next){
	//get and display all devices for this user
	console.log("ok here");
	res.render('stats')
});

router.get('/devices', function(req,res,next){
	var user = req.query.user;
	return Device.findDevicesForUser(user).then(function(results){
		return results.map(function(device){
			return device.username + "." + device.devname;
		});
	}).then(function(devices){
		return pgdb.fetch_devices_for_selected(devices)
	}).then(function(ids){
		res.send(ids);
	});
});


router.get('/bootstrap', function(req,res,next){
	console.log("ok bootstrapping");
	
	var deviceid = req.query.id;
	pgdb.stats_categories_for_device(deviceid).then(function(categories){
  		return categories;
  	}).then(function(categories){
  		return [categories, pgdb.fetch_companion_devices(deviceid)]
  	}).spread(function(categories, deviceids){
  		return [deviceids, categories, pgdb.stats_zone_histogram_for_devices(deviceids)]
  	}).spread(function(deviceids, categories, zones){
  		return [categories, zones, pgdb.stats_experiment_duration(deviceids)]
  	}).spread(function(categories, zones, duration){
  		return [categories, zones, duration, pgdb.stats_routine_for_device(deviceid)]
  	})
  	.spread(function(categories, zones, duration, routine){	
  		res.send({categories:categories, zones: zones,  duration: duration, routine: routine})
  	});
});

router.get('/zonebreakdown', function(req,res,next){
	var deviceid = req.query.id;
	var zone = req.query.zone;
	var from = req.query.from;
	var to = req.query.to;
	return pgdb.fetch_companion_devices(deviceid).then(function(deviceids){
		return pgdb.stats_zone_breakdown(deviceids, from, to);
	}).then(function(breakdown){
		res.send(breakdown);
	});
});

router.get('/categories', function(req,res,next){
	var deviceid = req.query.id;
	
	pgdb.stats_categories_for_device(deviceid).then(function(categories){
  		res.send(categories);
  	});
});

router.get('/histogram', function(req,res,next){
	var deviceid = req.query.id;
	var path = req.query.path;
	return pgdb.fetch_companion_devices(deviceid).then(function(deviceids){
		return pgdb.stats_histogram_for_device(deviceid, deviceids, path)
  	}).then(function(histogram){
  		res.send(histogram);
  	});
});

router.get('/zonehistogram', function(req,res,next){
	var deviceid = req.query.id;
	return pgdb.fetch_companion_devices(deviceid).then(function(deviceids){
		return pgdb.stats_zone_histogram_for_devices(deviceids)
  	}).then(function(histogram){
  		res.send(histogram);
  	});
});

//show all urls that have not yet been classified!
router.get('/unclassified', function(req,res,next){
	var deviceid = req.query.id;
	pgdb.stats_unclassified(deviceid).then(function(unclassified){
  		res.send(unclassified);
  	});
});


router.get('/routine', function(req,res,next){
	console.log("seen routine reqiest..");
	var deviceid = req.query.id;
	pgdb.stats_routine_for_device(deviceid).then(function(routines){
		res.send(routines);
	});
});

router.get('/classify', function(req,res,next){
	var deviceid = req.query.id;
	pgdb.stats_classify(deviceid).then(function(classified){
  		res.send(classified);
  	});
});

router.get('/browsing', function(req,res,next){
	var deviceid = req.query.id;
	var hourbin = 60*60;
	pgdb.stats_top_urls_for_device(deviceid, hourbin).then(function(urls){
  		res.send(urls);
  	});
});

router.get('/full', function(req,res,next){
	var deviceid = req.query.id;
	pgdb.fullstats_histogram_for_device(deviceid).then(function(histogram){
		console.log("----- full stats, sending ====");
    	console.log(histogram);
  		res.send(histogram);
	});
});



module.exports = router;
